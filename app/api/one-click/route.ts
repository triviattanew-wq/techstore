import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp, getUserAgent, normalizePhone } from '@/lib/rateLimit'

const oneClickSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().min(1).default(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Honeypot check
    if (body.website && body.website.length > 0) {
      return NextResponse.json({ success: true })
    }
    
    // Rate limit
    const ip = getClientIp(request)
    const { success: rateLimitSuccess } = rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 3,
      key: `oneclick:${ip}`,
    })
    
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429 }
      )
    }
    
    const result = oneClickSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const { name, phone, productId, variantId, quantity } = result.data
    
    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true, price: true, name: true },
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }
    
    const normalizedPhone = normalizePhone(phone)
    
    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name,
        phone: normalizedPhone,
        type: 'one-click',
        source: 'one-click',
        ipAddress: ip,
        userAgent: getUserAgent(request),
        totalAmount: Number(product.price) * quantity,
        items: {
          create: {
            productId,
            quantity,
            price: product.price,
            variantId,
          },
        },
      },
    })
    
    // Send notification
    console.log('One-click lead:', lead.id)
    
    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.',
    })
  } catch (error) {
    console.error('One-click error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
