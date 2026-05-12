import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Admin brands fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}
