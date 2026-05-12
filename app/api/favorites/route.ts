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

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { where: { isMain: true }, take: 1 },
            brand: true,
            variants: { take: 1 },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
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

    // Проверяем, не добавлен ли уже в избранное
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ error: 'Product already in favorites' }, { status: 400 })
    }

    // Добавляем в избранное
    const favorite = await prisma.favorite.create({
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

    return NextResponse.json({ success: true, favorite })
  } catch (error) {
    console.error('Add to favorites error:', error)
    return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 })
  }
}