export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const compareItems = await prisma.compareItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { where: { isMain: true }, take: 1 },
            brand: true,
            variants: true,
            characteristics: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(compareItems)
  } catch (error) {
    console.error('Compare fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch compare items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Проверяем, существует ли товар
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Проверяем лимит сравнения (максимум 4 товара)
    const compareCount = await prisma.compareItem.count({
      where: { userId: session.user.id }
    })

    if (compareCount >= 4) {
      return NextResponse.json({ error: 'Maximum 4 products can be compared' }, { status: 400 })
    }

    // Проверяем, не добавлен ли уже в сравнение
    const existingCompare = await prisma.compareItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    })

    if (existingCompare) {
      return NextResponse.json({ error: 'Product already in comparison' }, { status: 400 })
    }

    // Добавляем в сравнение
    const compareItem = await prisma.compareItem.create({
      data: {
        userId: session.user.id,
        productId: productId
      },
      include: {
        product: {
          include: {
            images: { where: { isMain: true }, take: 1 },
            brand: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, compareItem })
  } catch (error) {
    console.error('Add to compare error:', error)
    return NextResponse.json({ error: 'Failed to add to compare' }, { status: 500 })
  }
}
