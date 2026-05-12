const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixPrices() {
  try {
    const correctPrices = [
      { slug: 'iphone-17-pro-max', price: 149990, oldPrice: 159990 },
      { slug: 'iphone-17-pro',     price: 129990, oldPrice: 139990 },
      { slug: 'iphone-17',         price: 99990,  oldPrice: null },
      { slug: 'iphone-16-pro-max', price: 119990, oldPrice: 129990 },
      { slug: 'iphone-16-pro',     price: 109990, oldPrice: 119990 },
      { slug: 'iphone-16',         price: 89990,  oldPrice: 99990 },
      { slug: 'iphone-15-pro-max', price: 99990,  oldPrice: 129990 },
      { slug: 'iphone-15',         price: 69990,  oldPrice: 89990 },
    ]

    for (const item of correctPrices) {
      const result = await prisma.product.updateMany({
        where: { slug: item.slug },
        data: { price: item.price, oldPrice: item.oldPrice }
      })
      console.log(`✓ ${item.slug}: ${item.price}₽ (обновлено ${result.count})`)
    }

    console.log('\nГотово!')
  } catch (error) {
    console.error('Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixPrices()
