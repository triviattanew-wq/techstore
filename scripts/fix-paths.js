const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Обновить баннер
  await prisma.banner.updateMany({
    data: {
      imageDesktop: '/img/iphone-17-pro-display.jpg',
      imageMobile: '/img/iphone-17-pro-display.jpg',
    }
  });

  // Обновить категории
  await prisma.category.updateMany({ where: { slug: 'iphone' }, data: { image: '/img/17-Black.webp' } });
  await prisma.category.updateMany({ where: { slug: 'macbook' }, data: { image: '/img/macbook.jpg' } });
  await prisma.category.updateMany({ where: { slug: 'ipad' }, data: { image: '/img/iPad.jpeg' } });
  await prisma.category.updateMany({ where: { slug: 'airpods' }, data: { image: '/img/AirPods.jpg' } });
  await prisma.category.updateMany({ where: { slug: 'apple-watch' }, data: { image: '/img/AppleWatch.png' } });
  await prisma.category.updateMany({ where: { slug: 'accessories' }, data: { image: '/img/accesories.jpg' } });

  // Обновить товары
  const products = await prisma.product.findMany({ include: { images: true } });
  
  for (const p of products) {
    for (const img of p.images) {
      const newUrl = img.url.replace(/ /g, '-');
      if (newUrl !== img.url) {
        await prisma.productImage.update({
          where: { id: img.id },
          data: { url: newUrl }
        });
      }
    }
  }

  await prisma.$disconnect();
  console.log('Done');
}

run().catch(e => { console.error(e); process.exit(1); });
