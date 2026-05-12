import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity = 1, variantId } = body
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, isActive: true },
    })
    
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    const session = await getServerSession(authOptions)
    let sessionId = request.cookies.get('sessionId')?.value
    
    // Get or create cart
    let cart
    
    if (session?.user?.id) {
      cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
      })
      
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: session.user.id },
        })
      }
    } else {
      if (!sessionId) {
        sessionId = crypto.randomUUID()
      }
      
      cart = await prisma.cart.findUnique({
        where: { sessionId },
      })
      
      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionId },
        })
      }
    }
    
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    })
    
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          variantId,
        },
      })
    }
    
    const response = NextResponse.json({ success: true })
    
    // Set session cookie if new
    if (!request.cookies.get('sessionId') && sessionId) {
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }
    
    return response
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
