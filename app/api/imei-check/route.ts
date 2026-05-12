import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp, getUserAgent } from '@/lib/rateLimit'

const imeiSchema = z.object({
  imei: z.string().min(14, 'IMEI должен содержать минимум 14 цифр').max(17),
  name: z.string().optional(),
  phone: z.string().optional(),
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
      maxRequests: 5,
      key: `imei:${ip}`,
    })
    
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429 }
      )
    }
    
    const result = imeiSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const { imei, name, phone } = result.data
    
    const imeiRequest = await prisma.imeiCheckRequest.create({
      data: {
        imei: imei.replace(/\D/g, ''),
        name,
        phone: phone?.replace(/\D/g, ''),
        ipAddress: ip,
      },
    })
    
    console.log('IMEI check request:', imeiRequest.id)
    
    return NextResponse.json({
      success: true,
      requestId: imeiRequest.id,
      message: 'Заявка на проверку отправлена. Результат будет отправлен вам по телефону или email.',
    })
  } catch (error) {
    console.error('IMEI check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
