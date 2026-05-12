const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const products = await prisma.product.findMany({
    include: { images: true },
  });
  console.log('=== PRODUCTS ===');
  products.forEach(p => {
    console.log(`[${p.id}] ${p.name} | active:${p.isActive} featured:${p.isFeatured} new:${p.isNew} hit:${p.isHit}`);
    p.images.forEach(i => console.log('  img:', i.url));
  });

  const cats = await prisma.category.findMany();
  console.log('\n=== CATEGORIES ===');
  cats.forEach(c => console.log(`[${c.id}] ${c.name} | ${c.slug} | img: ${c.image}`));

  const banners = await prisma.banner.findMany();
  console.log('\n=== BANNERS ===');
  banners.forEach(b => console.log(`[${b.id}] ${b.title} | desktop: ${b.imageDesktop}`));

  await prisma.$disconnect();
}
check().catch(e => { console.error(e); process.exit(1); });
