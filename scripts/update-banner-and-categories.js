const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Обновить баннер на iphone-17-pro-display
  await prisma.banner.updateMany({
    data: {
      imageDesktop: '/img/iphone-17-pro-display.jpg',
      imageMobile: '/img/iphone-17-pro-display.jpg',
    }
  });
  console.log('✓ Banner updated');

  // Обновить категории с новыми картинками
  const updates = [
    { slug: 'iphone', image: '/img/17 Black.webp' },
    { slug: 'macbook', image: '/img/macbook.jpg' },
    { slug: 'ipad', image: '/img/iPad.jpeg' },
    { slug: 'airpods', image: '/img/AirPods.jpg' },
    { slug: 'apple-watch', image: '/img/AppleWatch.png' },
    { slug: 'accessories', image: '/img/accesories.jpg' },
  ];

  for (const u of updates) {
    await prisma.category.updateMany({
      where: { slug: u.slug },
      data: { image: u.image }
    });
    console.log(`✓ ${u.slug}: ${u.image}`);
  }

  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
