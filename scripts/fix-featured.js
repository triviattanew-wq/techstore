const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixFeatured() {
  try {
    // Делаем все товары featured, isNew или isHit чтобы они отображались на главной
    const updates = [
      { slug: 'iphone-17-pro-max', isFeatured: true, isNew: true,  isHit: true  },
      { slug: 'iphone-17-pro',     isFeatured: true, isNew: true,  isHit: true  },
      { slug: 'iphone-17',         isFeatured: true, isNew: true,  isHit: false },
      { slug: 'iphone-16-pro-max', isFeatured: true, isNew: false, isHit: true  },
      { slug: 'iphone-16-pro',     isFeatured: true, isNew: false, isHit: true  },
      { slug: 'iphone-16',         isFeatured: true, isNew: false, isHit: false },
      { slug: 'iphone-15-pro-max', isFeatured: false, isNew: false, isHit: true },
      { slug: 'iphone-15',         isFeatured: false, isNew: false, isHit: false },
    ]

    for (const u of updates) {
      await prisma.product.updateMany({
        where: { slug: u.slug },
        data: { isFeatured: u.isFeatured, isNew: u.isNew, isHit: u.isHit, isActive: true }
      })
      console.log(`✓ ${u.slug}: featured=${u.isFeatured}, new=${u.isNew}, hit=${u.isHit}`)
    }

    const counts = await prisma.product.groupBy({
      by: ['isActive'],
      _count: true
    })
    console.log('\nСтатус товаров:', counts)

    const featured = await prisma.product.count({ where: { isFeatured: true } })
    const isNew = await prisma.product.count({ where: { isNew: true } })
    const isHit = await prisma.product.count({ where: { isHit: true } })
    console.log(`Featured: ${featured}, New: ${isNew}, Hit: ${isHit}`)

  } catch (error) {
    console.error('Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixFeatured()
