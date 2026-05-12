const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixCategories() {
  try {
    console.log('Текущие категории:')
    const categories = await prisma.category.findMany()
    console.log(JSON.stringify(categories, null, 2))

    // Обновляем изображения категорий
    const updates = [
      { slug: 'iphone', image: '/img/17-Black.webp' },
      { slug: 'macbook', image: '/img/macbook.jpg' },
      { slug: 'ipad', image: '/img/iPad.jpeg' },
      { slug: 'airpods', image: '/img/AirPods.jpg' },
      { slug: 'apple-watch', image: '/img/AppleWatch.png' },
      { slug: 'accessories', image: '/img/accesories.jpg' },
    ]

    console.log('\nОбновляем изображения категорий...')
    for (const update of updates) {
      const result = await prisma.category.updateMany({
        where: { slug: update.slug },
        data: { image: update.image }
      })
      console.log(`${update.slug}: обновлено ${result.count} записей`)
    }

    console.log('\nОбновленные категории:')
    const updatedCategories = await prisma.category.findMany()
    console.log(JSON.stringify(updatedCategories, null, 2))

  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCategories()
