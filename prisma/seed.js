const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.adminUser.upsert({
    where: { email: 'admin@techstore.ru' },
    update: {},
    create: {
      email: 'admin@techstore.ru',
      passwordHash: adminPassword,
      name: 'Администратор',
      role: 'ADMIN',
    },
  })
  console.log('✓ Created admin user')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'iphone' },
      update: {},
      create: {
        name: 'iPhone',
        slug: 'iphone',
        description: 'Apple iPhone смартфоны',
        image: '/img/17-Black.webp',
        isActive: true,
        sortOrder: 0,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'macbook' },
      update: {},
      create: {
        name: 'MacBook',
        slug: 'macbook',
        description: 'Apple MacBook ноутбуки',
        image: '/img/macbook.webp',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ipad' },
      update: {},
      create: {
        name: 'iPad',
        slug: 'ipad',
        description: 'Apple iPad планшеты',
        image: '/img/iPad.webp',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'airpods' },
      update: {},
      create: {
        name: 'AirPods',
        slug: 'airpods',
        description: 'Apple AirPods наушники',
        image: '/img/AirPods.webp',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'apple-watch' },
      update: {},
      create: {
        name: 'Apple Watch',
        slug: 'apple-watch',
        description: 'Apple Watch умные часы',
        image: '/img/AppleWatch.webp',
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Аксессуары',
        slug: 'accessories',
        description: 'Аксессуары для техники',
        image: '/img/accesories.webp',
        isActive: true,
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'smart-home' },
      update: { name: 'Часы' },
      create: {
        name: 'Часы',
        slug: 'smart-home',
        description: 'Умные часы и аксессуары',
        image: '/img/AppleWatch.webp',
        isActive: true,
        sortOrder: 6,
      },
    }),
  ])
  console.log('✓ Created categories')

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'apple' },
      update: {},
      create: { name: 'Apple', slug: 'apple', isActive: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'samsung' },
      update: {},
      create: { name: 'Samsung', slug: 'samsung', isActive: true },
    }),
  ])
  console.log('✓ Created brands')

  // Create banners
  await Promise.all([
    prisma.banner.upsert({
      where: { id: 'banner-1' },
      update: {},
      create: {
        id: 'banner-1',
        title: 'iPhone 17 Pro Max',
        subtitle: 'Новое поколение',
        imageDesktop: '/img/iphone-17-pro-display.webp',
        imageMobile: '/img/iphone-17-pro-display.webp',
        link: '/product/iphone-17-pro-max',
        buttonText: 'Купить сейчас',
        isActive: true,
        sortOrder: 0,
      },
    }),
    prisma.banner.upsert({
      where: { id: 'banner-2' },
      update: {},
      create: {
        id: 'banner-2',
        title: 'MacBook Neo',
        subtitle: 'Мощность и производительность',
        imageDesktop: '/img/macbook.webp',
        imageMobile: '/img/macbook.webp',
        link: '/product/macbook-pro-16',
        buttonText: 'Узнать больше',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.banner.upsert({
      where: { id: 'banner-3' },
      update: {},
      create: {
        id: 'banner-3',
        title: 'iPad Pro 12.9"',
        subtitle: 'Творчество без границ',
        imageDesktop: '/img/iPad.webp',
        imageMobile: '/img/iPad.webp',
        link: '/product/ipad-pro',
        buttonText: 'Смотреть',
        isActive: true,
        sortOrder: 2,
      },
    }),
  ])
  console.log('✓ Created banners')

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'iphone-17-pro-max' },
      update: {},
      create: {
        name: 'iPhone 17 Pro Max',
        slug: 'iphone-17-pro-max',
        description: 'iPhone 17 Pro Max - последнее поколение iPhone',
        shortDesc: 'Флагманский смартфон Apple',
        price: 129990,
        oldPrice: 149990,
        categoryId: categories[0].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        isNew: true,
        isHit: true,
        images: {
          create: [
            {
              url: '/img/17-Pro-Max-Blue.webp',
              alt: 'iPhone 17 Pro Max Blue',
              sortOrder: 0,
              isMain: true,
            },
            {
              url: '/img/17-Pro-Max-Orange.webp',
              alt: 'iPhone 17 Pro Max Orange',
              sortOrder: 1,
              isMain: false,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'iphone-17-pro' },
      update: {},
      create: {
        name: 'iPhone 17 Pro Silver',
        slug: 'iphone-17-pro',
        description: 'iPhone 17 Pro в серебристом цвете с улучшенной камерой',
        shortDesc: 'Смартфон Apple',
        price: 99990,
        oldPrice: 119990,
        categoryId: categories[0].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        isNew: true,
        images: {
          create: [
            {
              url: '/img/17-Pro-Silver.webp',
              alt: 'iPhone 17 Pro Silver',
              sortOrder: 0,
              isMain: true,
            },
            {
              url: '/img/17-Black.webp',
              alt: 'iPhone 17 Pro Black',
              sortOrder: 1,
              isMain: false,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'iphone-17' },
      update: {},
      create: {
        name: 'iPhone 17 White',
        slug: 'iphone-17',
        description: 'iPhone 17 в белом цвете - новый стандарт',
        shortDesc: 'Смартфон Apple',
        price: 79990,
        categoryId: categories[0].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        isNew: true,
        images: {
          create: [
            {
              url: '/img/17-White.webp',
              alt: 'iPhone 17 White',
              sortOrder: 0,
              isMain: true,
            },
            {
              url: '/img/17-Blue.webp',
              alt: 'iPhone 17 Blue',
              sortOrder: 1,
              isMain: false,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'macbook-pro-16' },
      update: {},
      create: {
        name: 'MacBook Neo',
        slug: 'macbook-pro-16',
        description: 'MacBook Neo - мощный ноутбук для профессионалов',
        shortDesc: 'Профессиональный ноутбук Apple',
        price: 299990,
        categoryId: categories[1].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        isHit: true,
        images: {
          create: [
            {
              url: '/img/macbook.webp',
              alt: 'MacBook Neo',
              sortOrder: 0,
              isMain: true,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'ipad-pro' },
      update: {},
      create: {
        name: 'iPad Pro 12.9"',
        slug: 'ipad-pro',
        description: 'iPad Pro с M2 - мощный планшет для творчества',
        shortDesc: 'Мощный планшет Apple',
        price: 149990,
        categoryId: categories[2].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        isHit: true,
        images: {
          create: [
            {
              url: '/img/iPad.webp',
              alt: 'iPad Pro 12.9"',
              sortOrder: 0,
              isMain: true,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'airpods-pro' },
      update: {},
      create: {
        name: 'AirPods Pro 2',
        slug: 'airpods-pro',
        description: 'AirPods Pro 2 с активным шумоподавлением',
        shortDesc: 'Премиум наушники Apple',
        price: 34990,
        categoryId: categories[3].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        images: {
          create: [
            {
              url: '/img/AirPods.webp',
              alt: 'AirPods Pro',
              sortOrder: 0,
              isMain: true,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'apple-watch-series-9' },
      update: {},
      create: {
        name: 'Apple Watch Series 9',
        slug: 'apple-watch-series-9',
        description: 'Apple Watch Series 9 - умные часы нового поколения',
        shortDesc: 'Умные часы Apple',
        price: 44990,
        categoryId: categories[4].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        images: {
          create: [
            {
              url: '/img/AppleWatch.webp',
              alt: 'Apple Watch Series 9',
              sortOrder: 0,
              isMain: true,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'iphone-16-pro' },
      update: {},
      create: {
        name: 'iPhone 16 Pro Black',
        slug: 'iphone-16-pro',
        description: 'iPhone 16 Pro в черном цвете - предыдущее поколение',
        shortDesc: 'Смартфон Apple',
        price: 89990,
        oldPrice: 109990,
        categoryId: categories[0].id,
        brandId: brands[0].id,
        isActive: true,
        isHit: true,
        images: {
          create: [
            {
              url: '/img/iphone16pro-black.webp',
              alt: 'iPhone 16 Pro Black',
              sortOrder: 0,
              isMain: true,
            },
            {
              url: '/img/iphone16pro-white.webp',
              alt: 'iPhone 16 Pro White',
              sortOrder: 1,
              isMain: false,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'iphone-16' },
      update: {},
      create: {
        name: 'iPhone 16 Black',
        slug: 'iphone-16',
        description: 'iPhone 16 в черном цвете - доступный флагман',
        shortDesc: 'Смартфон Apple',
        price: 69990,
        categoryId: categories[0].id,
        brandId: brands[0].id,
        isActive: true,
        isFeatured: true,
        images: {
          create: [
            {
              url: '/img/iphone16-black.webp',
              alt: 'iPhone 16 Black',
              sortOrder: 0,
              isMain: true,
            },
            {
              url: '/img/iphone16-blue.webp',
              alt: 'iPhone 16 Blue',
              sortOrder: 1,
              isMain: false,
            },
          ],
        },
      },
    }),
  ])
  console.log('✓ Created products')

  // Create reviews
  await Promise.all([
    prisma.review.create({
      data: {
        productId: products[0].id,
        authorName: 'Иван Петров',
        rating: 5,
        title: 'Отличный смартфон!',
        text: 'Очень доволен покупкой. Камера супер, батарея держит весь день.',
        isPublished: true,
      },
    }),
  ])
  console.log('✓ Created reviews')

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
