const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeXiaomi() {
  console.log('Removing Xiaomi brand...')

  try {
    // Сначала проверим, есть ли товары Xiaomi
    const xiaomiBrand = await prisma.brand.findUnique({
      where: { slug: 'xiaomi' },
      include: {
        products: true
      }
    })

    if (!xiaomiBrand) {
      console.log('Xiaomi brand not found')
      return
    }

    console.log(`Found Xiaomi brand with ${xiaomiBrand.products.length} products`)

    // Удаляем товары Xiaomi (если есть)
    if (xiaomiBrand.products.length > 0) {
      for (const product of xiaomiBrand.products) {
        console.log(`Deleting product: ${product.name}`)
        
        // Удаляем связанные данные
        await prisma.productImage.deleteMany({
          where: { productId: product.id }
        })
        
        await prisma.productVariant.deleteMany({
          where: { productId: product.id }
        })
        
        await prisma.productCharacteristic.deleteMany({
          where: { productId: product.id }
        })
        
        await prisma.favorite.deleteMany({
          where: { productId: product.id }
        })
        
        await prisma.compareItem.deleteMany({
          where: { productId: product.id }
        })
        
        await prisma.cartItem.deleteMany({
          where: { productId: product.id }
        })
        
        await prisma.leadItem.deleteMany({
          where: { productId: product.id }
        })
        
        // Удаляем сам товар
        await prisma.product.delete({
          where: { id: product.id }
        })
      }
    }

    // Удаляем бренд Xiaomi
    await prisma.brand.delete({
      where: { id: xiaomiBrand.id }
    })

    console.log('✓ Xiaomi brand and all related products removed successfully!')

    // Показываем оставшиеся бренды
    const remainingBrands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    })

    console.log('\nRemaining brands:')
    remainingBrands.forEach(brand => {
      console.log(`- ${brand.name} (${brand.slug})`)
    })

  } catch (error) {
    console.error('Error removing Xiaomi:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeXiaomi()