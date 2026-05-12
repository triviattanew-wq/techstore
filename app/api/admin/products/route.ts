import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { 
            where: { isMain: true }, 
            take: 1,
            orderBy: { sortOrder: 'asc' }
          },
          brand: { select: { name: true } },
          category: { select: { name: true } },
          _count: { select: { variants: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const response = NextResponse.json({
      products: products.map(p => ({
        ...p,
        price: Number(p.price),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      })),
      total,
      pages: Math.ceil(total / limit),
      page,
    })

    // Add caching headers
    response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120')
    
    return response
  } catch (error) {
    console.error('Admin products fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      products: [],
      total: 0,
      pages: 0,
      page: 1
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      name,
      slug,
      sku,
      description,
      shortDesc,
      price,
      oldPrice,
      categoryId,
      brandId,
      warranty,
      isActive,
      isNew,
      isFeatured,
      isHit,
      seoTitle,
      seoDesc,
      images,
      variants,
      characteristics,
    } = data

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        shortDesc,
        price,
        oldPrice,
        categoryId,
        brandId: brandId || null,
        warranty,
        isActive,
        isNew,
        isFeatured,
        isHit,
        seoTitle,
        seoDesc,
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            sortOrder: index,
            isMain: index === 0,
          })),
        },
        variants: {
          create: variants.map((variant: any) => ({
            color: variant.color || null,
            colorCode: variant.colorCode || null,
            memory: variant.memory || null,
            simType: variant.simType || null,
            price: variant.price ? parseFloat(variant.price) : null,
            stock: variant.stock || 0,
          })),
        },
        characteristics: {
          create: characteristics.map((char: any, index: number) => ({
            name: char.name,
            value: char.value,
            group: char.group || 'Основные',
            sortOrder: index,
          })),
        },
      },
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}