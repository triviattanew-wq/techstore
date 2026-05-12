const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Все доступные картинки
const imgs = {
  black:  '/img/16black.jpg.webp',
  blue:   '/img/16blue.jpg.webp',
  green:  '/img/16green.jpg.webp',
  pink:   '/img/16pink.jpg.webp',
  white:  '/img/16white.jpg.webp',
  i1:     '/img/1c011e50364ca06348e7158c1c9075a3a580dcfc8054cf47cf76558f20c344c6.jpg.webp',
  i2:     '/img/1c6e6dccc3a48eb3a4606105e1649ead9029ab21fd07a770521d2b10304aec1f.jpg.webp',
  i3:     '/img/3f07b1ffa9193a775d83d5a74fa818307037b9e0cf34e51a18ac31304fceefb9.jpg.webp',
  i4:     '/img/aaf891bb9bd2e85d9f42c857050d91c87a1cc49830176911f7c6c261e6294098.jpg.webp',
  i5:     '/img/b29b8f777cf483f7916d2bfe10bb8241074f98e8f9a7ba4bf623d8efc23a98bf.jpg.webp',
  i6:     '/img/caef1b85893bb11bb88e2ebbce8d78897e4e4964ab484e4476e359d6e82c7097.jpg.webp',
  i7:     '/img/ce0e6e9a6df1808b3097c7d61fe138ab456fb5ef5f238abc52663d5de3fe2fa4.jpg.webp',
  i8:     '/img/d679c0bdd12d960f252841cd1977a139639ee4cee385d0707fd8bd5913cb8051.jpg.webp',
  i9:     '/img/e9676e2a4cebbd0205b4cdcd95ab3e8bb010249c2e101345fa4b5c3599d91b74.jpg.webp',
  i10:    '/img/ebbeae95e9ab52cc2089a18b04a6ee629bc4693d05d6ce4ffdf963aa6a62d38b.jpg.webp',
  i11:    '/img/ff04b19080be26b9468d9ff7ed74faaf3533965fd683f1dd02b5e598406d60af.jpg.webp',
};

// Маппинг товаров → картинки
const productImages = {
  'iphone-17-pro-max': [imgs.black, imgs.white, imgs.blue, imgs.pink],
  'iphone-17-pro':     [imgs.green, imgs.i6, imgs.pink, imgs.black],
  'iphone-17':         [imgs.white, imgs.i5, imgs.blue, imgs.green],
  'iphone-16-pro-max': [imgs.i1, imgs.i2, imgs.black, imgs.white],
};

// Маппинг категорий → картинки
const categoryImages = {
  'iphone':      imgs.black,
  'macbook':     imgs.i3,
  'ipad':        imgs.i7,
  'airpods':     imgs.i4,
  'apple-watch': imgs.i9,
  'accessories': imgs.i10,
};

async function run() {
  // 1. Обновить картинки категорий
  console.log('Updating categories...');
  const cats = await prisma.category.findMany();
  for (const cat of cats) {
    const img = categoryImages[cat.slug];
    if (img) {
      await prisma.category.update({ where: { id: cat.id }, data: { image: img } });
      console.log(`  Category ${cat.name}: ${img}`);
    }
  }

  // 2. Обновить картинки товаров
  console.log('\nUpdating product images...');
  const products = await prisma.product.findMany({ include: { images: true } });

  for (const product of products) {
    const newImages = productImages[product.slug];
    if (!newImages) {
      console.log(`  Skipping ${product.name} (no image mapping)`);
      continue;
    }

    // Удалить старые картинки
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    // Добавить новые
    for (let i = 0; i < newImages.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: newImages[i],
          alt: product.name,
          sortOrder: i,
          isMain: i === 0,
        }
      });
    }
    console.log(`  ${product.name}: ${newImages.length} images`);
  }

  // 3. Убедиться что все товары активны и видны покупателям
  console.log('\nActivating all products...');
  await prisma.product.updateMany({
    data: { isActive: true }
  });

  // Сделать первые 4 товара featured
  const allProducts = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
  for (let i = 0; i < allProducts.length; i++) {
    await prisma.product.update({
      where: { id: allProducts[i].id },
      data: {
        isFeatured: i < 4,
        isNew: i < 3,
        isHit: i < 2,
      }
    });
  }

  // 4. Обновить баннер
  console.log('\nUpdating banner...');
  await prisma.banner.updateMany({
    data: {
      imageDesktop: imgs.black,
      imageMobile: imgs.black,
    }
  });

  // 5. Добавить недостающие товары если их мало
  const count = await prisma.product.count();
  console.log(`\nTotal products: ${count}`);

  if (count < 6) {
    console.log('Adding more products...');
    const iphoneCat = await prisma.category.findFirst({ where: { slug: 'iphone' } });
    if (iphoneCat) {
      const extraProducts = [
        {
          name: 'iPhone 16 Pro',
          slug: 'iphone-16-pro',
          sku: 'IP16P-001',
          price: 109990,
          oldPrice: 119990,
          isActive: true, isFeatured: true, isNew: false, isHit: true,
          categoryId: iphoneCat.id,
          images: [imgs.i2, imgs.i6, imgs.i8],
        },
        {
          name: 'iPhone 16',
          slug: 'iphone-16',
          sku: 'IP16-001',
          price: 89990,
          oldPrice: 99990,
          isActive: true, isFeatured: true, isNew: false, isHit: false,
          categoryId: iphoneCat.id,
          images: [imgs.i7, imgs.i11, imgs.white],
        },
        {
          name: 'iPhone 15 Pro Max',
          slug: 'iphone-15-pro-max',
          sku: 'IP15PM-001',
          price: 99990,
          oldPrice: 129990,
          isActive: true, isFeatured: false, isNew: false, isHit: true,
          categoryId: iphoneCat.id,
          images: [imgs.i9, imgs.i10, imgs.i3],
        },
        {
          name: 'iPhone 15',
          slug: 'iphone-15',
          sku: 'IP15-001',
          price: 69990,
          oldPrice: 89990,
          isActive: true, isFeatured: false, isNew: false, isHit: false,
          categoryId: iphoneCat.id,
          images: [imgs.i11, imgs.i5, imgs.green],
        },
      ];

      for (const p of extraProducts) {
        const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
        if (!exists) {
          const created = await prisma.product.create({
            data: {
              name: p.name, slug: p.slug, sku: p.sku,
              price: p.price, oldPrice: p.oldPrice,
              isActive: p.isActive, isFeatured: p.isFeatured,
              isNew: p.isNew, isHit: p.isHit,
              categoryId: p.categoryId,
              description: `${p.name} — флагманский смартфон Apple с передовыми технологиями.`,
              shortDesc: `${p.name} с официальной гарантией Apple`,
              warranty: '1 год официальной гарантии Apple',
            }
          });
          for (let i = 0; i < p.images.length; i++) {
            await prisma.productImage.create({
              data: {
                productId: created.id,
                url: p.images[i],
                alt: p.name,
                sortOrder: i,
                isMain: i === 0,
              }
            });
          }
          // Добавить варианты
          const variants = [
            { memory: '128GB', stock: 10 },
            { memory: '256GB', stock: 8 },
            { memory: '512GB', stock: 5 },
          ];
          for (const v of variants) {
            await prisma.productVariant.create({
              data: { productId: created.id, memory: v.memory, stock: v.stock, price: created.price }
            });
          }
          console.log(`  Created: ${p.name}`);
        }
      }
    }
  }

  await prisma.$disconnect();
  console.log('\nDone!');
}

run().catch(e => { console.error(e); process.exit(1); });
