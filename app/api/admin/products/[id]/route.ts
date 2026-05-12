export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { id: 'asc' } },
        characteristics: { orderBy: { sortOrder: 'asc' } },
        brand: true,
        category: true,
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
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

    // Проверяем, существует ли товар
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Проверяем уникальность slug, если он изменился
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id: productId }
        }
      })
      
      if (slugExists) {
        return NextResponse.json({ error: 'Товар с таким slug уже существует' }, { status: 400 })
      }
    }

    // Обновляем товар в транзакции
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Обновляем основную информацию о товаре
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          slug,
          sku,
          description,
          shortDesc,
          price: parseFloat(price),
          oldPrice: oldPrice ? parseFloat(oldPrice) : null,
          categoryId,
          brandId: brandId || null,
          warranty,
          isActive,
          isNew,
          isFeatured,
          isHit,
          seoTitle,
          seoDesc,
        }
      })

      // Удаляем старые изображения
      await tx.productImage.deleteMany({
        where: { productId }
      })

      // Добавляем новые изображения
      if (images && images.length > 0) {
        const imageData = Array.isArray(images[0]) || typeof images[0] === 'object'
          ? images.map((img: any, index: number) => ({
              productId,
              url: typeof img === 'string' ? img : img.url,
              sortOrder: index,
              isMain: index === 0,
            }))
          : images.map((url: string, index: number) => ({
              productId,
              url,
              sortOrder: index,
              isMain: index === 0,
            }));
        
        await tx.productImage.createMany({ data: imageData });
      }

      // Удаляем старые варианты
      await tx.productVariant.deleteMany({
        where: { productId }
      })

      // Добавляем новые варианты
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((variant: any) => ({
            productId,
            color: variant.color || null,
            colorCode: variant.colorCode || null,
            memory: variant.memory || null,
            simType: variant.simType || null,
            price: variant.price ? parseFloat(variant.price) : null,
            stock: variant.stock || 0,
          }))
        })
      }

      // Удаляем старые характеристики
      await tx.productCharacteristic.deleteMany({
        where: { productId }
      })

      // Добавляем новые характеристики
      if (characteristics && characteristics.length > 0) {
        await tx.productCharacteristic.createMany({
          data: characteristics.map((char: any, index: number) => ({
            productId,
            name: char.name,
            value: char.value,
            group: char.group || 'Основные',
            sortOrder: index,
          }))
        })
      }

      return product
    })

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error: any) {
    console.error('Product update error:', error)
    
    // Обработка ошибок Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Товар с таким slug или артикулом уже существует' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Ошибка при обновлении товара: ' + (error.message || 'Неизвестная ошибка')
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    // Проверяем, существует ли товар
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Удаляем товар и все связанные данные в транзакции
    await prisma.$transaction(async (tx) => {
      // Удаляем связанные данные
      await tx.productImage.deleteMany({ where: { productId } })
      await tx.productVariant.deleteMany({ where: { productId } })
      await tx.productCharacteristic.deleteMany({ where: { productId } })
      await tx.favorite.deleteMany({ where: { productId } })
      await tx.compareItem.deleteMany({ where: { productId } })
      await tx.cartItem.deleteMany({ where: { productId } })
      await tx.leadItem.deleteMany({ where: { productId } })
      await tx.relatedProduct.deleteMany({ 
        where: { 
          OR: [
            { productId },
            { relatedId: productId }
          ]
        }
      })

      // Удаляем сам товар
      await tx.product.delete({ where: { id: productId } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}