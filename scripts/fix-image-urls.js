const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  // Fix product images with spaces in URLs
  const images = await prisma.productImage.findMany({
    where: { url: { contains: ' ' } }
  });
  console.log('Images with spaces:', images.length);

  for (const img of images) {
    const newUrl = img.url.replace(/ /g, '');
    await prisma.productImage.update({
      where: { id: img.id },
      data: { url: newUrl }
    });
    console.log(img.url, '->', newUrl);
  }

  // Fix category images
  const cats = await prisma.category.findMany({
    where: { image: { contains: ' ' } }
  });
  console.log('Categories with spaces:', cats.length);
  for (const cat of cats) {
    const newImg = cat.image ? cat.image.replace(/ /g, '') : cat.image;
    await prisma.category.update({ where: { id: cat.id }, data: { image: newImg } });
    console.log(cat.image, '->', newImg);
  }

  // Fix banners
  const banners = await prisma.banner.findMany();
  for (const b of banners) {
    const updates = {};
    if (b.imageDesktop && b.imageDesktop.includes(' ')) updates.imageDesktop = b.imageDesktop.replace(/ /g, '');
    if (b.imageMobile && b.imageMobile.includes(' ')) updates.imageMobile = b.imageMobile.replace(/ /g, '');
    if (Object.keys(updates).length) {
      await prisma.banner.update({ where: { id: b.id }, data: updates });
      console.log('Banner fixed:', b.id);
    }
  }

  await prisma.$disconnect();
  console.log('Done!');
}

fix().catch(e => { console.error(e); process.exit(1); });
