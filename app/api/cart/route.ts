export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

async function getCart(userId: string | null, sessionId: string | null) {
  if (userId) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                oldPrice: true,
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
      },
    })
  }
  
  if (sessionId) {
    return prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                oldPrice: true,
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
      },
    })
  }
  
  return null
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionId = request.cookies.get('sessionId')?.value
  
  const cart = await getCart(session?.user?.id || null, sessionId || null)
  
  return NextResponse.json({
    items: cart?.items || [],
    totalItems: cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    totalPrice: cart?.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0) || 0,
  })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionId = request.cookies.get('sessionId')?.value
  
  if (session?.user?.id) {
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: session.user.id } },
    })
  } else if (sessionId) {
    await prisma.cartItem.deleteMany({
      where: { cart: { sessionId } },
    })
  }
  
  return NextResponse.json({ success: true })
}

