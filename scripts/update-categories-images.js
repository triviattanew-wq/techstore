const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  await prisma.category.updateMany({ where: { slug: 'ipad' }, data: { image: '/img/iPad.jpeg' } });
  await prisma.category.updateMany({ where: { slug: 'apple-watch' }, data: { image: '/img/AppleWatch.png' } });
  await prisma.category.updateMany({ where: { slug: 'accessories' }, data: { image: '/img/accesories.jpg' } });
  await prisma.category.updateMany({ where: { slug: 'macbook' }, data: { image: '/img/macbook.jpg' } });
  await prisma.category.updateMany({ where: { slug: 'airpods' }, data: { image: '/img/AirPods.jpg' } });
  await prisma.$disconnect();
  console.log('Done');
})();
