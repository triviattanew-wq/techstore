export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const category = searchParams.get('category')
  const brands = searchParams.get('brands')?.split(',').filter(Boolean)
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const memory = searchParams.get('memory')?.split(',').filter(Boolean)
  const color = searchParams.get('color')?.split(',').filter(Boolean)
  const inStock = searchParams.get('inStock') === 'true'
  const isNew = searchParams.get('isNew') === 'true'
  const isHit = searchParams.get('isHit') === 'true'
  const sort = searchParams.get('sort') || 'popular'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search')

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = { isActive: true }

  if (category) {
    where.category = { slug: category }
  }

  if (brands && brands.length > 0) {
    where.brand = { slug: { in: brands } }
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }

  if (inStock) {
    where.stocks = { some: { quantity: { gt: 0 } } }
  }

  if (isNew) {
    where.isNew = true
  }

  if (isHit) {
    where.isHit = true
  }

  if (memory && memory.length > 0) {
    where.variants = { some: { memory: { in: memory } } }
  }

  if (color && color.length > 0) {
    where.variants = { some: { color: { in: color } } }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { brand: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  // Build orderBy
  let orderBy: any = {}
  switch (sort) {
    case 'price-asc':
      orderBy = { price: 'asc' }
      break
    case 'price-desc':
      orderBy = { price: 'desc' }
      break
    case 'newest':
      orderBy = { createdAt: 'desc' }
      break
    case 'name':
      orderBy = { name: 'asc' }
      break
    default:
      orderBy = { viewCount: 'desc' }
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 2 },
          brand: { select: { name: true, slug: true } },
          variants: {
            select: { id: true, color: true, colorCode: true, memory: true, stock: true },
          },
          stocks: { select: { quantity: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      images: p.images,
      brand: p.brand,
      variants: p.variants,
      isNew: p.isNew,
      isHit: p.isHit,
      stock: p.stocks.reduce((sum, s) => sum + s.quantity, 0),
    }))

    const response = NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300')
    response.headers.set('Vary', 'Accept-Encoding')

    return response
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

