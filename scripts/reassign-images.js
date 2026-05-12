const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Правильный маппинг: товар → картинки (на основе визуального анализа)
const productImages = {
  'iphone-17-pro-max': [
    '/img/iphone17pro-black.webp',
    '/img/iphone17pro-natural.webp',
    '/img/iphone17pro-white.webp',
  ],
  'iphone-17-pro': [
    '/img/iphone17pro-natural.webp',
    '/img/iphone17pro-white.webp',
    '/img/iphone17pro-black.webp',
  ],
  'iphone-17': [
    '/img/iphone16-white.webp',
    '/img/iphone16-black.webp',
    '/img/iphone16-blue.webp',
    '/img/iphone16-green.webp',
    '/img/iphone16-pink.webp',
  ],
  'iphone-16-pro-max': [
    '/img/iphone16pro-white.webp',
    '/img/iphone16pro-orange.webp',
    '/img/iphone16pro-black.webp',
  ],
  'iphone-16-pro': [
    '/img/iphone16pro-black.webp',
    '/img/iphone16pro-white.webp',
    '/img/iphone16pro-orange.webp',
  ],
  'iphone-16': [
    '/img/iphone16-black.webp',
    '/img/iphone16-white.webp',
    '/img/iphone16-blue.webp',
    '/img/iphone16-green.webp',
    '/img/iphone16-pink.webp',
  ],
  'iphone-15-pro-max': [
    '/img/iphone16plus-white.webp',
    '/img/iphone16plus-black.webp',
    '/img/iphone16plus-blue.webp',
  ],
  'iphone-15': [
    '/img/iphone16plus-pink.webp',
    '/img/iphone16plus-green.webp',
    '/img/iphone16plus-white.webp',
    '/img/iphone16plus-blue.webp',
    '/img/iphone16plus-black.webp',
  ],
};

// Баннер — iPhone 17 Pro Black
const bannerImage = '/img/iphone17pro-black.webp';

// Категории
const categoryImages = {
  'iphone':      '/img/iphone16-black.webp',
  'macbook':     '/img/iphone17pro-natural.webp',
  'ipad':        '/img/iphone16pro-white.webp',
  'airpods':     '/img/iphone16plus-white.webp',
  'apple-watch': '/img/iphone16plus-green.webp',
  'accessories': '/img/iphone16plus-pink.webp',
};

async function run() {
  // Обновить картинки товаров
  console.log('Updating product images...');
  const products = await prisma.product.findMany();

  for (const product of products) {
    const images = productImages[product.slug];
    if (!images) {
      console.log(`  No mapping for: ${product.name} (${product.slug})`);
      continue;
    }

    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: images[i],
          alt: product.name,
          sortOrder: i,
          isMain: i === 0,
        }
      });
    }
    console.log(`  ✓ ${product.name}: ${images.length} images`);
  }

  // Обновить баннер
  console.log('\nUpdating banner...');
  await prisma.banner.updateMany({
    data: { imageDesktop: bannerImage, imageMobile: bannerImage }
  });

  // Обновить категории
  console.log('\nUpdating categories...');
  const cats = await prisma.category.findMany();
  for (const cat of cats) {
    const img = categoryImages[cat.slug];
    if (img) {
      await prisma.category.update({ where: { id: cat.id }, data: { image: img } });
      console.log(`  ✓ ${cat.name}: ${img}`);
    }
  }

  await prisma.$disconnect();
  console.log('\nDone!');
}

run().catch(e => { console.error(e); process.exit(1); });
