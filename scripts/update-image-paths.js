const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updatePaths() {
  try {
    // Замены путей: старый → новый
    const replacements = [
      { from: '/img/AirPods.jpg',                  to: '/img/AirPods.webp' },
      { from: '/img/AppleWatch.png',               to: '/img/AppleWatch.webp' },
      { from: '/img/iPad.jpeg',                    to: '/img/iPad.webp' },
      { from: '/img/macbook.jpg',                  to: '/img/macbook.webp' },
      { from: '/img/accesories.jpg',               to: '/img/accesories.webp' },
      { from: '/img/iphone-17-pro-display.jpg',    to: '/img/iphone-17-pro-display.webp' },
    ]

    console.log('=== Обновление категорий ===')
    for (const r of replacements) {
      const result = await prisma.category.updateMany({
        where: { image: r.from },
        data: { image: r.to }
      })
      if (result.count > 0) console.log(`✓ Категория: ${r.from} → ${r.to}`)
    }

    console.log('\n=== Обновление баннеров ===')
    for (const r of replacements) {
      const result = await prisma.banner.updateMany({
        where: { imageDesktop: r.from },
        data: { imageDesktop: r.to }
      })
      if (result.count > 0) console.log(`✓ Баннер desktop: ${r.from} → ${r.to}`)
      
      const result2 = await prisma.banner.updateMany({
        where: { imageMobile: r.from },
        data: { imageMobile: r.to }
      })
      if (result2.count > 0) console.log(`✓ Баннер mobile: ${r.from} → ${r.to}`)
    }

    console.log('\n=== Обновление изображений товаров ===')
    for (const r of replacements) {
      const result = await prisma.productImage.updateMany({
        where: { url: r.from },
        data: { url: r.to }
      })
      if (result.count > 0) console.log(`✓ Товар: ${r.from} → ${r.to} (${result.count} шт.)`)
    }

    console.log('\n=== Итоговые пути категорий ===')
    const cats = await prisma.category.findMany({ select: { name: true, image: true } })
    cats.forEach(c => console.log(`  ${c.name}: ${c.image}`))

    console.log('\n=== Итоговые пути баннеров ===')
    const banners = await prisma.banner.findMany({ select: { title: true, imageDesktop: true } })
    banners.forEach(b => console.log(`  ${b.title}: ${b.imageDesktop}`))

  } catch (error) {
    console.error('Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

updatePaths()
