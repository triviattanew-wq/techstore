export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp, getUserAgent, normalizePhone } from '@/lib/rateLimit'

const tradeInSchema = z.object({
  brand: z.string().min(1, 'Выберите бренд'),
  model: z.string().min(1, 'Укажите модель'),
  condition: z.string().min(1, 'Укажите состояние'),
  memory: z.string().optional(),
  kit: z.string().optional(),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  comment: z.string().max(1000).optional(),
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
      key: `tradein:${ip}`,
    })
    
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429 }
      )
    }
    
    const result = tradeInSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const { brand, model, condition, memory, kit, name, phone, comment } = result.data
    
    const tradeInRequest = await prisma.tradeInRequest.create({
      data: {
        brand,
        model,
        condition,
        memory,
        kit,
        name,
        phone: normalizePhone(phone),
        comment,
        ipAddress: ip,
        userAgent: getUserAgent(request),
      },
    })
    
    console.log('Trade-in request:', tradeInRequest.id)
    
    return NextResponse.json({
      success: true,
      requestId: tradeInRequest.id,
      message: 'Заявка отправлена. Мы свяжемся с вами для уточнения стоимости.',
    })
  } catch (error) {
    console.error('Trade-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

