const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProducts() {
  console.log('Checking products in database...')

  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
        brand: true,
        category: true,
      },
    })

    console.log(`\nFound ${products.length} products:`)
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Price: ${product.price} ₽`)
      console.log(`   Brand: ${product.brand?.name || 'No brand'}`)
      console.log(`   Category: ${product.category?.name || 'No category'}`)
      console.log(`   Images: ${product.images.length}`)
      console.log(`   Variants: ${product.variants.length}`)
      console.log(`   Active: ${product.isActive ? 'Yes' : 'No'}`)
    })

    const categories = await prisma.category.findMany()
    console.log(`\nCategories: ${categories.length}`)
    categories.forEach(cat => console.log(`- ${cat.name} (${cat.slug})`))

    const brands = await prisma.brand.findMany()
    console.log(`\nBrands: ${brands.length}`)
    brands.forEach(brand => console.log(`- ${brand.name} (${brand.slug})`))

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()