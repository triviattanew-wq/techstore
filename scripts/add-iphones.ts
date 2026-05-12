import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addIPhones() {
  console.log('Adding iPhone models...')

  // Get Apple brand and smartphones category
  const appleBrand = await prisma.brand.findUnique({ where: { slug: 'apple' } })
  const smartphonesCategory = await prisma.category.findUnique({ where: { slug: 'smartphones' } })

  if (!appleBrand || !smartphonesCategory) {
    console.error('Apple brand or smartphones category not found')
    return
  }

  const iphones = [
    {
      name: 'iPhone 17 Pro Max 256GB',
      slug: 'iphone-17-pro-max-256gb',
      sku: 'IPHONE17PROMAX256',
      description: `
        <p>iPhone 17 Pro Max — самый мощный iPhone с революционным чипом A19 Pro и невероятными возможностями камеры.</p>
        <h3>Особенности</h3>
        <ul>
          <li>Дисплей Super Retina XDR 6.9"</li>
          <li>Процессор A19 Pro</li>
          <li>Основная камера 48 Мп с новым сенсором</li>
          <li>Титановый корпус Grade 5</li>
          <li>Кнопка Camera Control с тактильной обратной связью</li>
          <li>Время работы до 33 часов видео</li>
        </ul>
      `,
      shortDesc: 'Самый мощный iPhone с чипом A19 Pro и камерой 48 Мп',
      price: 139990,
      oldPrice: 149990,
      categoryId: smartphonesCategory.id,
      brandId: appleBrand.id,
      isActive: true,
      isNew: true,
      isFeatured: true,
      warranty: '1 год официальной гарантии Apple',
      images: [
        '/img/16black.jpg.webp',
        '/img/16white.jpg.webp',
        '/img/16 blue.jpg.webp',
      ],
      variants: [
        { color: 'Natural Titanium', colorCode: '#8A8A8F', memory: '256GB', price: 139990, stock: 5 },
        { color: 'Blue Titanium', colorCode: '#394C6D', memory: '256GB', price: 139990, stock: 3 },
        { color: 'White Titanium', colorCode: '#F5F5F7', memory: '256GB', price: 139990, stock: 4 },
        { color: 'Black Titanium', colorCode: '#1D1D1F', memory: '256GB', price: 139990, stock: 6 },
        { color: 'Natural Titanium', colorCode: '#8A8A8F', memory: '512GB', price: 159990, stock: 2 },
        { color: 'Natural Titanium', colorCode: '#8A8A8F', memory: '1TB', price: 179990, stock: 1 },
      ],
      characteristics: [
        { name: 'Дисплей', value: '6.9" Super Retina XDR', group: 'Экран' },
        { name: 'Разрешение', value: '2868 × 1320 пикселей', group: 'Экран' },
        { name: 'Процессор', value: 'A19 Pro', group: 'Процессор' },
        { name: 'Память', value: '256 ГБ', group: 'Память' },
        { name: 'Основная камера', value: '48 Мп + 12 Мп + 12 Мп', group: 'Камера' },
        { name: 'Фронтальная камера', value: '12 Мп', group: 'Камера' },
        { name: 'Батарея', value: '4441 мАч', group: 'Батарея' },
        { name: 'Вес', value: '227 г', group: 'Габариты' },
        { name: 'Размеры', value: '163.0 × 77.6 × 8.25 мм', group: 'Габариты' },
      ],
    },
    {
      name: 'iPhone 17 Pro 256GB',
      slug: 'iphone-17-pro-256gb',
      sku: 'IPHONE17PRO256',
      description: `
        <p>iPhone 17 Pro с чипом A19 Pro — профессиональные возможности в компактном корпусе.</p>
        <h3>Особенности</h3>
        <ul>
          <li>Дисплей Super Retina XDR 6.3"</li>
          <li>Процессор A19 Pro</li>
          <li>Основная камера 48 Мп</li>
          <li>Титановый корпус</li>
          <li>Кнопка Camera Control</li>
        </ul>
      `,
      shortDesc: 'iPhone Pro с чипом A19 Pro и профессиональной камерой',
      price: 119990,
      oldPrice: 129990,
      categoryId: smartphonesCategory.id,
      brandId: appleBrand.id,
      isActive: true,
      isNew: true,
      isFeatured: true,
      warranty: '1 год официальной гарантии Apple',
      images: [
        '/img/16 blue.jpg.webp',
        '/img/16white.jpg.webp',
        '/img/16black.jpg.webp',
      ],
      variants: [
        { color: 'Natural Titanium', colorCode: '#8A8A8F', memory: '256GB', price: 119990, stock: 8 },
        { color: 'Blue Titanium', colorCode: '#394C6D', memory: '256GB', price: 119990, stock: 6 },
        { color: 'White Titanium', colorCode: '#F5F5F7', memory: '256GB', price: 119990, stock: 7 },
        { color: 'Black Titanium', colorCode: '#1D1D1F', memory: '256GB', price: 119990, stock: 5 },
        { color: 'Natural Titanium', colorCode: '#8A8A8F', memory: '512GB', price: 139990, stock: 3 },
      ],
      characteristics: [
        { name: 'Дисплей', value: '6.3" Super Retina XDR', group: 'Экран' },
        { name: 'Процессор', value: 'A19 Pro', group: 'Процессор' },
        { name: 'Память', value: '256 ГБ', group: 'Память' },
        { name: 'Камера', value: '48 Мп + 12 Мп + 12 Мп', group: 'Камера' },
        { name: 'Батарея', value: '3582 мАч', group: 'Батарея' },
        { name: 'Вес', value: '199 г', group: 'Габариты' },
      ],
    },
    {
      name: 'iPhone 17 256GB',
      slug: 'iphone-17-256gb',
      sku: 'IPHONE17256',
      description: `
        <p>iPhone 17 — новое поколение iPhone с улучшенной камерой и производительностью.</p>
        <h3>Особенности</h3>
        <ul>
          <li>Дисплей Super Retina XDR 6.1"</li>
          <li>Процессор A19</li>
          <li>Основная камера 48 Мп</li>
          <li>Алюминиевый корпус</li>
        </ul>
      `,
      shortDesc: 'Новый iPhone 17 с камерой 48 Мп и чипом A19',
      price: 89990,
      categoryId: smartphonesCategory.id,
      brandId: appleBrand.id,
      isActive: true,
      isNew: true,
      warranty: '1 год официальной гарантии Apple',
      images: [
        '/img/16 pink.jpg.webp',
        '/img/16 blue.jpg.webp',
        '/img/16green.jpg.webp',
        '/img/16white.jpg.webp',
        '/img/16black.jpg.webp',
      ],
      variants: [
        { color: 'Pink', colorCode: '#F7C6D0', memory: '256GB', price: 89990, stock: 10 },
        { color: 'Blue', colorCode: '#4A90E2', memory: '256GB', price: 89990, stock: 8 },
        { color: 'Green', colorCode: '#7ED321', memory: '256GB', price: 89990, stock: 6 },
        { color: 'White', colorCode: '#FFFFFF', memory: '256GB', price: 89990, stock: 12 },
        { color: 'Black', colorCode: '#000000', memory: '256GB', price: 89990, stock: 9 },
        { color: 'Pink', colorCode: '#F7C6D0', memory: '512GB', price: 109990, stock: 4 },
      ],
      characteristics: [
        { name: 'Дисплей', value: '6.1" Super Retina XDR', group: 'Экран' },
        { name: 'Процессор', value: 'A19', group: 'Процессор' },
        { name: 'Память', value: '256 ГБ', group: 'Память' },
        { name: 'Камера', value: '48 Мп + 12 Мп', group: 'Камера' },
        { name: 'Батарея', value: '3349 мАч', group: 'Батарея' },
        { name: 'Вес', value: '170 г', group: 'Габариты' },
      ],
    },
    {
      name: 'iPhone 16 Pro Max 256GB',
      slug: 'iphone-16-pro-max-256gb',
      sku: 'IPHONE16PROMAX256',
      description: `
        <p>iPhone 16 Pro Max с чипом A18 Pro — максимальная производительность и камера профессионального уровня.</p>
        <h3>Особенности</h3>
        <ul>
          <li>Дисплей Super Retina XDR 6.9"</li>
          <li>Процессор A18 Pro</li>
          <li>Основная камера 48 Мп</li>
          <li>Титановый корпус</li>
          <li>Кнопка Camera Control</li>
        </ul>
      `,
      shortDesc: 'iPhone 16 Pro Max с чипом A18 Pro и титановым корпусом',
      price: 129990,
      oldPrice: 139990,
      categoryId: smartphonesCategory.id,
      brandId: appleBrand.id,
      isActive: true,
      isFeatured: true,
      isHit: true,
      warranty: '1 год официальной гарантии Apple',
      images: [
        '/img/16black.jpg.webp',
        '/img/16white.jpg.webp',
        '/img/16 blue.jpg.webp',
      ],
      variants: [
        { color: 'Natural Titanium', colorCode: '#8A8A8F', memory: '256GB', price: 129990, stock: 7 },
        { color: 'Blue Titanium', colorCode: '#394C6D', memory: '256GB', price: 129990, stock: 5 },
        { color: 'White Titanium', colorCode: '#F5F5F7', memory: '256GB', price: 129990, stock: 6 },
        { color: 'Black Titanium', colorCode: '#1D1D1F', memory: '256GB', price: 129990, stock: 4 },
        { color: 'Natural Titanium', colorCode: '#8A8A8F', memory: '512GB', price: 149990, stock: 2 },
      ],
      characteristics: [
        { name: 'Дисплей', value: '6.9" Super Retina XDR', group: 'Экран' },
        { name: 'Процессор', value: 'A18 Pro', group: 'Процессор' },
        { name: 'Память', value: '256 ГБ', group: 'Память' },
        { name: 'Камера', value: '48 Мп + 12 Мп + 12 Мп', group: 'Камера' },
        { name: 'Батарея', value: '4441 мАч', group: 'Батарея' },
        { name: 'Вес', value: '227 г', group: 'Габариты' },
      ],
    },
  ]

  for (const iphone of iphones) {
    try {
      const product = await prisma.product.create({
        data: {
          name: iphone.name,
          slug: iphone.slug,
          sku: iphone.sku,
          description: iphone.description,
          shortDesc: iphone.shortDesc,
          price: iphone.price,
          oldPrice: iphone.oldPrice || null,
          categoryId: iphone.categoryId,
          brandId: iphone.brandId,
          warranty: iphone.warranty,
          isActive: iphone.isActive,
          isNew: iphone.isNew || false,
          isFeatured: iphone.isFeatured || false,
          isHit: iphone.isHit || false,
          seoTitle: `${iphone.name} — купить в TechStore`,
          seoDesc: `Купить ${iphone.name} в TechStore. ${iphone.shortDesc}`,
          images: {
            create: iphone.images.map((url, index) => ({
              url,
              sortOrder: index,
              isMain: index === 0,
            })),
          },
          variants: {
            create: iphone.variants.map((variant) => ({
              color: variant.color,
              colorCode: variant.colorCode,
              memory: variant.memory,
              price: variant.price,
              stock: variant.stock,
            })),
          },
          characteristics: {
            create: iphone.characteristics.map((char, index) => ({
              name: char.name,
              value: char.value,
              group: char.group,
              sortOrder: index,
            })),
          },
        },
      })
      console.log(`✓ Created ${product.name}`)
    } catch (error) {
      console.error(`✗ Failed to create ${iphone.name}:`, error)
    }
  }

  console.log('iPhone models added successfully!')
}

addIPhones()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })