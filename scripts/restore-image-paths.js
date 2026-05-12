const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function restore() {
  try {
    const replacements = [
      { from: '/img/AirPods.webp',                 to: '/img/AirPods.jpg' },
      { from: '/img/AppleWatch.webp',              to: '/img/AppleWatch.png' },
      { from: '/img/iPad.webp',                    to: '/img/iPad.jpeg' },
      { from: '/img/macbook.webp',                 to: '/img/macbook.jpg' },
      { from: '/img/accesories.webp',              to: '/img/accesories.jpg' },
      { from: '/img/iphone-17-pro-display.webp',   to: '/img/iphone-17-pro-display.jpg' },
    ]

    for (const r of replacements) {
      const cat = await prisma.category.updateMany({ where: { image: r.from }, data: { image: r.to } })
      const ban = await prisma.banner.updateMany({ where: { imageDesktop: r.from }, data: { imageDesktop: r.to } })
      const ban2 = await prisma.banner.updateMany({ where: { imageMobile: r.from }, data: { imageMobile: r.to } })
      if (cat.count || ban.count || ban2.count)
        console.log(`✓ ${r.from} → ${r.to}`)
    }

    console.log('\nКатегории:')
    const cats = await prisma.category.findMany({ select: { name: true, image: true } })
    cats.forEach(c => console.log(`  ${c.name}: ${c.image}`))

    console.log('\nБаннеры:')
    const banners = await prisma.banner.findMany({ select: { title: true, imageDesktop: true } })
    banners.forEach(b => console.log(`  ${b.title}: ${b.imageDesktop}`))

  } catch (e) {
    console.error(e.message)
  } finally {
    await prisma.$disconnect()
  }
}

restore()
