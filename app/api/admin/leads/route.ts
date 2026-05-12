export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = status && status !== 'all' ? { status: status as any } : {}

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    const response = NextResponse.json({
      leads: leads.map(lead => ({
        ...lead,
        totalAmount: lead.totalAmount ? Number(lead.totalAmount) : null,
      })),
      total,
      pages: Math.ceil(total / limit),
      page,
    })

    // Add caching headers
    response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Admin leads fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch leads',
      leads: [],
      total: 0,
      pages: 0,
      page: 1
    }, { status: 500 })
  }
}
