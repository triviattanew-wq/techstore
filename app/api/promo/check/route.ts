export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  
  if (!code) {
    return NextResponse.json({ valid: false, message: 'Укажите промокод' }, { status: 400 })
  }

  try {
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    })

    if (!promo) {
      return NextResponse.json({ valid: false, message: 'Промокод не найден или истёк срок действия' })
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ valid: false, message: 'Промокод уже использован максимальное количество раз' })
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discount: Number(promo.discount),
      isPercent: promo.isPercent,
    })
  } catch (error) {
    console.error('Promo check error:', error)
    return NextResponse.json({ valid: false, message: 'Ошибка при проверке промокода' }, { status: 500 })
  }
}

