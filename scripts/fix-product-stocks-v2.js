const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixProductStocks() {
  try {
    // Проверяем, есть ли склад
    let warehouse = await prisma.warehouse.findFirst()
    
    if (!warehouse) {
      console.log('Создаем основной склад...')
      warehouse = await prisma.warehouse.create({
        data: {
          name: 'Основной склад',
          address: 'Москва, ул. Примерная, 1',
          isActive: true
        }
      })
      console.log(`✓ Склад создан: ${warehouse.name}`)
    } else {
      console.log(`✓ Используем склад: ${warehouse.name}`)
    }

    console.log('\nПроверяем остатки товаров...')
    
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
        
        // Создаем общий остаток для товара
        const quantity = product.variants.reduce((sum, v) => sum + (v.stock || 10), 0) || 10
        
        await prisma.stock.create({
          data: {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: quantity
          }
        })
        console.log(`  ✓ Добавлен остаток: ${quantity} шт.`)
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
