import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
  console.log('Created admin user')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: {
        name: 'Смартфоны',
        slug: 'smartphones',
        description: 'Смартфоны Apple iPhone, Samsung Galaxy, Xiaomi и других брендов',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        seoTitle: 'Смартфоны — купить в TechStore',
        seoDesc: 'Смартфоны Apple, Samsung, Xiaomi. Официальная гарантия, быстрая доставка.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tablets' },
      update: {},
      create: {
        name: 'Планшеты',
        slug: 'tablets',
        description: 'iPad, планшеты Samsung, Xiaomi и другие',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
        seoTitle: 'Планшеты — купить в TechStore',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: {
        name: 'Ноутбуки и компьютеры',
        slug: 'laptops',
        description: 'MacBook, ноутбуки, моноблоки и компьютеры',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'audio' },
      update: {},
      create: {
        name: 'Аудио',
        slug: 'audio',
        description: 'Наушники, колонки и аудиосистемы',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Аксессуары',
        slug: 'accessories',
        description: 'Чехлы, зарядки, кабели и другие аксессуары',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'smart-home' },
      update: { name: 'Часы' },
      create: {
        name: 'Часы',
        slug: 'smart-home',
        description: 'Умные часы и аксессуары',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      },
    }),
  ])
  console.log('Created categories')

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'apple' },
      update: {},
      create: { name: 'Apple', slug: 'apple' },
    }),
    prisma.brand.upsert({
      where: { slug: 'samsung' },
      update: {},
      create: { name: 'Samsung', slug: 'samsung' },
    }),
    prisma.brand.upsert({
      where: { slug: 'xiaomi' },
      update: {},
      create: { name: 'Xiaomi', slug: 'xiaomi' },
    }),
    prisma.brand.upsert({
      where: { slug: 'google' },
      update: {},
      create: { name: 'Google', slug: 'google' },
    }),
    prisma.brand.upsert({
      where: { slug: 'sony' },
      update: {},
      create: { name: 'Sony', slug: 'sony' },
    }),
  ])
  console.log('Created brands')

  // Create banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'iPhone 16 Pro',
        subtitle: 'Новый уровень профессиональных возможностей',
        imageDesktop: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200',
        imageMobile: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
        link: '/product/iphone-16-pro-256gb',
        buttonText: 'Купить',
        sortOrder: 0,
      },
      {
        title: 'MacBook Pro M3',
        subtitle: 'Невероятная производительность',
        imageDesktop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200',
        link: '/catalog/laptops',
        buttonText: 'Смотреть каталог',
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  })
  console.log('Created banners')

  // Create pages
  await prisma.page.createMany({
    data: [
      {
        title: 'Доставка',
        slug: 'delivery',
        content: '<h1>Доставка</h1><p>Мы осуществляем доставку по всей России.</p>',
      },
      {
        title: 'Гарантия',
        slug: 'warranty',
        content: '<h1>Гарантия</h1><p>Вся техника имеет официальную гарантию.</p>',
      },
      {
        title: 'О компании',
        slug: 'about',
        content: '<h1>О компании</h1><p>TechStore — магазин электроники.</p>',
      },
      {
        title: 'Контакты',
        slug: 'contacts',
        content: '<h1>Контакты</h1><p>Телефон: 8 (800) 123-45-67</p>',
      },
      {
        title: 'Политика конфиденциальности',
        slug: 'privacy',
        content: '<h1>Политика конфиденциальности</h1>',
      },
    ],
    skipDuplicates: true,
  })
  console.log('Created pages')

  // Create promo codes
  await prisma.promoCode.createMany({
    data: [
      { code: 'WELCOME10', discount: 10, isPercent: true },
      { code: 'FIRST500', discount: 500, isPercent: false },
    ],
    skipDuplicates: true,
  })
  console.log('Created promo codes')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
