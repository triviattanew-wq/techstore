const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixProductStocks() {
  try {
    console.log('Проверяем остатки товаров...')
    
    const products = await prisma.product.findMany({
      include: {
        stocks: true,
        variants: true
      }
    })

    console.log(`Всего товаров: ${products.length}`)

    for (const product of products) {
      if (product.stocks.length === 0) {
        console.log(`\nТовар без остатков: ${product.name}`)
        
        // Создаем остатки на основе вариантов
        if (product.variants.length > 0) {
          for (const variant of product.variants) {
            await prisma.stock.create({
              data: {
                productId: product.id,
                variantId: variant.id,
                quantity: variant.stock || 10,
                location: 'Основной склад'
              }
            })
            console.log(`  ✓ Добавлен остаток для варианта: ${variant.memory || variant.color || 'default'} - ${variant.stock || 10} шт.`)
          }
        } else {
          // Если нет вариантов, создаем общий остаток
          await prisma.stock.create({
            data: {
              productId: product.id,
              quantity: 10,
              location: 'Основной склад'
            }
          })
          console.log(`  ✓ Добавлен общий остаток: 10 шт.`)
        }
      } else {
        console.log(`✓ ${product.name}: ${product.stocks.length} записей остатков`)
      }
    }

    console.log('\n=== ПРОВЕРКА ПОСЛЕ ОБНОВЛЕНИЯ ===')
    const updatedProducts = await prisma.product.findMany({
      include: {
        stocks: true
      }
    })

    updatedProducts.forEach(p => {
      const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0)
      console.log(`${p.name}: ${totalStock} шт. (${p.stocks.length} записей)`)
    })

  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductStocks()
