const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function initDatabase() {
  try {
    console.log('Инициализация базы данных...')

    // Создаем бренд Apple
    const appleBrand = await prisma.brand.upsert({
      where: { slug: 'apple' },
      update: {},
      create: {
        name: 'Apple',
        slug: 'apple',
        logo: '/img/apple-logo.png',
        isActive: true,
      },
    })
    console.log('✓ Бренд Apple создан')

    // Создаем категории
    const categories = [
      { name: 'iPhone', slug: 'iphone', image: '/img/16black.jpg.webp' },
      { name: 'MacBook', slug: 'macbook', image: '/img/16blue.jpg.webp' },
      { name: 'iPad', slug: 'ipad', image: '/img/16green.jpg.webp' },
      { name: 'AirPods', slug: 'airpods', image: '/img/16pink.jpg.webp' },
      { name: 'Apple Watch', slug: 'apple-watch', image: '/img/16white.jpg.webp' },
      { name: 'Аксессуары', slug: 'accessories', image: '/img/aaf891bb9bd2e85d9f42c857050d91c87a1cc49830176911f7c6c261e6294098.jpg.webp' },
    ]

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          ...cat,
          isActive: true,
          sortOrder: categories.indexOf(cat),
        },
      })
    }
    console.log('✓ Категории созданы')

    // Создаем склад
    const warehouse = await prisma.warehouse.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        name: 'Основной склад',
        address: 'Москва',
        isActive: true,
      },
    })
    console.log('✓ Склад создан')

    // Получаем категорию iPhone
    const iphoneCategory = await prisma.category.findUnique({
      where: { slug: 'iphone' }
    })

    if (!iphoneCategory) {
      throw new Error('iPhone category not found')
    }

    // Создаем iPhone модели
    const iphones = [
      {
        name: 'iPhone 17 Pro Max',
        slug: 'iphone-17-pro-max',
        price: 149990,
        oldPrice: 159990,
        isNew: true,
        isHit: true,
        isFeatured: true,
        images: [
          { url: '/img/16black.jpg.webp', alt: 'iPhone 17 Pro Max', sortOrder: 0, isMain: true },
          { url: '/img/16 blue.jpg.webp', alt: 'iPhone 17 Pro Max Blue', sortOrder: 1 },
          { url: '/img/16white.jpg.webp', alt: 'iPhone 17 Pro Max White', sortOrder: 2 },
        ],
        variants: [
          { color: 'Черный', colorCode: '#000000', memory: '256GB', stock: 10 },
          { color: 'Синий', colorCode: '#0066CC', memory: '512GB', stock: 5 },
        ],
      },
      {
        name: 'iPhone 17 Pro',
        slug: 'iphone-17-pro',
        price: 129990,
        oldPrice: 139990,
        isNew: true,
        isHit: false,
        isFeatured: true,
        images: [
          { url: '/img/16green.jpg.webp', alt: 'iPhone 17 Pro', sortOrder: 0, isMain: true },
          { url: '/img/16 pink.jpg.webp', alt: 'iPhone 17 Pro Pink', sortOrder: 1 },
          { url: '/img/caef1b85893bb11bb88e2ebbce8d78897e4e4964ab484e4476e359d6e82c7097.jpg.webp', alt: 'iPhone 17 Pro Gold', sortOrder: 2 },
        ],
        variants: [
          { color: 'Зеленый', colorCode: '#00AA00', memory: '256GB', stock: 8 },
          { color: 'Розовый', colorCode: '#FF69B4', memory: '512GB', stock: 3 },
        ],
      },
      {
        name: 'iPhone 17',
        slug: 'iphone-17',
        price: 99990,
        oldPrice: null,
        isNew: true,
        isHit: false,
        isFeatured: false,
        images: [
          { url: '/img/16white.jpg.webp', alt: 'iPhone 17', sortOrder: 0, isMain: true },
          { url: '/img/b29b8f777cf483f7916d2bfe10bb8241074f98e8f9a7ba4bf623d8efc23a98bf.jpg.webp', alt: 'iPhone 17 Black', sortOrder: 1 },
        ],
        variants: [
          { color: 'Белый', colorCode: '#FFFFFF', memory: '128GB', stock: 12 },
        ],
      },
      {
        name: 'iPhone 16 Pro Max',
        slug: 'iphone-16-pro-max',
        price: 119990,
        oldPrice: 129990,
        isNew: false,
        isHit: true,
        isFeatured: true,
        images: [
          { url: '/img/1c011e50364ca06348e7158c1c9075a3a580dcfc8054cf47cf76558f20c344c6.jpg.webp', alt: 'iPhone 16 Pro Max', sortOrder: 0, isMain: true },
          { url: '/img/d679c0bdd12d960f252841cd1977a139639ee4cee385d0707fd8bd5913cb8051.jpg.webp', alt: 'iPhone 16 Pro Max Blue', sortOrder: 1 },
        ],
        variants: [
          { color: 'Титановый', colorCode: '#C0C0C0', memory: '256GB', stock: 6 },
        ],
      },
    ]

    for (const phone of iphones) {
      const product = await prisma.product.create({
        data: {
          name: phone.name,
          slug: phone.slug,
          price: phone.price,
          oldPrice: phone.oldPrice,
          categoryId: iphoneCategory.id,
          brandId: appleBrand.id,
          isActive: true,
          isNew: phone.isNew,
          isHit: phone.isHit,
          isFeatured: phone.isFeatured,
          shortDesc: `${phone.name} - новейший смартфон от Apple с передовыми технологиями`,
          description: `${phone.name} представляет собой вершину инноваций Apple. Оснащен мощным процессором, профессиональной камерой и долговечной батареей.`,
          warranty: '1 год',
          viewCount: Math.floor(Math.random() * 1000),
          sortOrder: iphones.indexOf(phone),
        },
      })

      // Добавляем изображения
      for (const img of phone.images) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder,
            isMain: img.isMain || false,
          },
        })
      }

      // Добавляем варианты
      for (const variant of phone.variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            color: variant.color,
            colorCode: variant.colorCode,
            memory: variant.memory,
            stock: variant.stock,
            isActive: true,
          },
        })
      }

      // Добавляем на склад (только один раз на продукт)
      const totalStock = phone.variants.reduce((sum, v) => sum + v.stock, 0)
      await prisma.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: product.id,
            warehouseId: warehouse.id,
          }
        },
        update: {
          quantity: totalStock,
        },
        create: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: totalStock,
        },
      })

      // Добавляем характеристики
      const characteristics = [
        { name: 'Диагональ экрана', value: '6.7"', group: 'Экран' },
        { name: 'Разрешение', value: '2796×1290', group: 'Экран' },
        { name: 'Процессор', value: 'A18 Pro', group: 'Производительность' },
        { name: 'Оперативная память', value: '8 ГБ', group: 'Производительность' },
        { name: 'Основная камера', value: '48 Мп', group: 'Камера' },
        { name: 'Фронтальная камера', value: '12 Мп', group: 'Камера' },
        { name: 'Батарея', value: '4422 мАч', group: 'Автономность' },
        { name: 'Беспроводная зарядка', value: 'Да', group: 'Автономность' },
      ]

      for (const char of characteristics) {
        await prisma.productCharacteristic.create({
          data: {
            productId: product.id,
            name: char.name,
            value: char.value,
            group: char.group,
            sortOrder: characteristics.indexOf(char),
          },
        })
      }

      console.log(`✓ ${phone.name} создан`)
    }

    // Создаем баннер
    await prisma.banner.upsert({
      where: { id: 'hero-banner' },
      update: {},
      create: {
        id: 'hero-banner',
        title: 'iPhone 17 Pro Max',
        subtitle: 'Новое поколение',
        imageDesktop: '/img/16black.jpg.webp',
        imageMobile: '/img/16black.jpg.webp',
        link: '/product/iphone-17-pro-max',
        buttonText: 'Купить сейчас',
        isActive: true,
        sortOrder: 0,
      },
    })
    console.log('✓ Баннер создан')

    // Создаем отзывы
    const reviews = [
      {
        authorName: 'Алексей М.',
        rating: 5,
        title: 'Отличный телефон!',
        text: 'Очень доволен покупкой. Камера супер, батарея держит долго.',
        isPublished: true,
      },
      {
        authorName: 'Мария К.',
        rating: 4,
        title: 'Хороший выбор',
        text: 'Качество на высоте, доставка быстрая. Рекомендую!',
        isPublished: true,
      },
    ]

    const products = await prisma.product.findMany({ take: 2 })
    
    for (let i = 0; i < reviews.length; i++) {
      await prisma.review.create({
        data: {
          ...reviews[i],
          productId: products[i].id,
        },
      })
    }
    console.log('✓ Отзывы созданы')

    console.log('🎉 База данных успешно инициализирована!')
    
  } catch (error) {
    console.error('Ошибка инициализации:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase()