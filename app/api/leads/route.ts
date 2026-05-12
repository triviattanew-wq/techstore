import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp, getUserAgent, normalizePhone } from '@/lib/rateLimit'

const leadSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(18),
  email: z.string().email().optional().or(z.literal('')),
  comment: z.string().max(1000).optional(),
  promoCode: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1).default(1),
    variantId: z.string().optional(),
    price: z.number().or(z.string()),
  })),
  source: z.string().optional(),
})

// Honeypot check
const honeypotSchema = z.object({
  website: z.string().max(0), // Should be empty
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Honeypot check
    if (body.website && body.website.length > 0) {
      return NextResponse.json({ success: true }) // Silent reject
    }
    
    // Rate limit
    const ip = getClientIp(request)
    const rateLimitKey = `lead:${ip}`
    const { success: rateLimitSuccess } = rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 3,
      key: rateLimitKey,
    })
    
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429 }
      )
    }
    
    // Validate input
    const result = leadSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const { name, phone, email, comment, promoCode, items, source } = result.data
    
    // Normalize phone
    const normalizedPhone = normalizePhone(phone)
    
    // Calculate total
    let totalAmount = 0
    let discount = 0
    
    // Validate products and get prices
    const productIds = items.map(i => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true, price: true },
    })
    
    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Некоторые товары не найдены' }, { status: 400 })
    }
    
    // Check promo code
    if (promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: {
          code: promoCode,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      })
      
      if (promo) {
        const subTotal = items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId)!
          return sum + Number(product.price) * item.quantity
        }, 0)
        
        if (promo.isPercent) {
          discount = subTotal * Number(promo.discount) / 100
        } else {
          discount = Number(promo.discount)
        }
        
        // Update promo code usage
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { usageCount: { increment: 1 } },
        })
      }
    }
    
    totalAmount = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + Number(product.price) * item.quantity
    }, 0) - discount
    
    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name,
        phone: normalizedPhone,
        email: email || null,
        comment,
        promoCode,
        discount: discount > 0 ? discount : null,
        totalAmount,
        source,
        type: items.length > 0 ? 'cart' : 'form',
        ipAddress: ip,
        userAgent: getUserAgent(request),
        items: {
          create: items.map(item => {
            const product = products.find(p => p.id === item.productId)!
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
              variantId: item.variantId,
            }
          }),
        },
      },
      include: { items: true },
    })
    
    // Clear cart if needed
    const sessionId = request.cookies.get('sessionId')?.value
    if (sessionId) {
      await prisma.cartItem.deleteMany({
        where: { cart: { sessionId } },
      })
    }
    
    // Send notification (in background)
    sendLeadNotification(lead)
    
    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      message: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.' 
    })
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendLeadNotification(lead: any) {
  // Implement email notification
  // This would use nodemailer or similar
  console.log('New lead:', lead.id)
}

export async function GET(request: NextRequest) {
  // Admin endpoint to list leads
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  
  const where = status ? { status: status as any } : {}
  
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ])
  
  return NextResponse.json({
    leads,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}
