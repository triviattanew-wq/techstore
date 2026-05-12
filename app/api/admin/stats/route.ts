import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      productsCount,
      activeProductsCount,
      leadsCount,
      newLeadsCount,
      reviewsCount,
      pendingReviewsCount,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.review.count().catch(() => 0), // Если таблица отзывов не существует
      prisma.review.count({ where: { isPublished: false } }).catch(() => 0),
    ])

    const response = NextResponse.json({
      productsCount,
      activeProductsCount,
      leadsCount,
      newLeadsCount,
      reviewsCount,
      pendingReviewsCount,
    })

    // Кэшируем статистику на 5 минут
    response.headers.set('Cache-Control', 'private, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error) {
    console.error('Admin stats fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      productsCount: 0,
      activeProductsCount: 0,
      leadsCount: 0,
      newLeadsCount: 0,
      reviewsCount: 0,
      pendingReviewsCount: 0,
    }, { status: 500 })
  }
}