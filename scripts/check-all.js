const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

async function checkAll() {
  try {
    console.log('=== ПРОВЕРКА ИЗОБРАЖЕНИЙ ТОВАРОВ ===')
    const products = await prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: 'asc' } } }
    })

    for (const p of products) {
      console.log(`\n${p.name}:`)
      for (const img of p.images) {
        const filePath = path.join('public', img.url)
        const exists = fs.existsSync(filePath)
        console.log(`  ${exists ? '✓' : '✗ ФАЙЛ НЕ НАЙДЕН'} ${img.url}`)
      }
    }

    console.log('\n=== ПРОВЕРКА ИЗОБРАЖЕНИЙ КАТЕГОРИЙ ===')
    const categories = await prisma.category.findMany()
    for (const c of categories) {
      if (c.image) {
        const filePath = path.join('public', c.image)
        const exists = fs.existsSync(filePath)
        console.log(`${exists ? '✓' : '✗ ФАЙЛ НЕ НАЙДЕН'} ${c.name}: ${c.image}`)
      }
    }

    console.log('\n=== ПРОВЕРКА БАННЕРОВ ===')
    const banners = await prisma.banner.findMany()
    if (banners.length === 0) {
      console.log('Баннеры не найдены в БД!')
    }
    for (const b of banners) {
      console.log(`Баннер: ${b.title}`)
      if (b.imageDesktop) {
        const exists = fs.existsSync(path.join('public', b.imageDesktop))
        console.log(`  Desktop: ${exists ? '✓' : '✗ НЕ НАЙДЕН'} ${b.imageDesktop}`)
      }
    }

  } catch (error) {
    console.error('Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAll()
