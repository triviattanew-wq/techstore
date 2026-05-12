const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkProductsCategories() {
  try {
    console.log('=== КАТЕГОРИИ ===')
    const categories = await prisma.category.findMany()
    categories.forEach(cat => {
      console.log(`${cat.name} (${cat.slug}): ID = ${cat.id}`)
    })

    console.log('\n=== ТОВАРЫ И ИХ КАТЕГОРИИ ===')
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: { take: 1 }
      }
    })
    
    products.forEach(p => {
      console.log(`${p.name}:`)
      console.log(`  - Category: ${p.category?.name || 'НЕТ'} (${p.category?.slug || 'НЕТ'})`)
      console.log(`  - CategoryId: ${p.categoryId}`)
      console.log(`  - Active: ${p.isActive}`)
      console.log(`  - Image: ${p.images[0]?.url || 'НЕТ'}`)
    })

    console.log('\n=== ТОВАРЫ В КАТЕГОРИИ iPhone ===')
    const iphoneCategory = categories.find(c => c.slug === 'iphone')
    if (iphoneCategory) {
      const iphoneProducts = await prisma.product.findMany({
        where: {
          categoryId: iphoneCategory.id,
          isActive: true
        },
        include: {
          images: { take: 1 }
        }
      })
      console.log(`Найдено товаров: ${iphoneProducts.length}`)
      iphoneProducts.forEach(p => {
        console.log(`- ${p.name} (${p.slug})`)
      })
    } else {
      console.log('Категория iPhone не найдена!')
    }

  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductsCategories()
