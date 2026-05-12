import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HeroBanner } from '@/components/HeroBanner'
import { CategoryGrid } from '@/components/CategoryGrid'
import { ProductGrid } from '@/components/ProductGrid'
import { Features } from '@/components/Features'
import { TradeInBlock } from '@/components/TradeInBlock'
import { ImeiCheckBlock } from '@/components/ImeiCheckBlock'
import { LazySection } from '@/components/LazySection'
import { ProductGridSkeleton } from '@/components/LoadingSkeleton'

// Отключаем кэширование для главной страницы
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getHomeData() {
  const [
    categories,
    banners,
    featuredProducts,
    newProducts,
    hitProducts,
    reviews,
  ] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { select: { color: true, colorCode: true, memory: true, stock: true } },
      },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, isNew: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { select: { color: true, colorCode: true, memory: true, stock: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, isHit: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { select: { color: true, colorCode: true, memory: true, stock: true } },
      },
      orderBy: { viewCount: 'desc' },
      take: 8,
    }),
    prisma.review.findMany({
      where: { isPublished: true },
      include: {
        images: true,
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  return {
    categories: categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
    })),
    banners: banners.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageDesktop: b.imageDesktop,
      imageMobile: b.imageMobile,
      link: b.link,
      buttonText: b.buttonText,
    })),
    featuredProducts: featuredProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      images: p.images,
      variants: p.variants,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isHit: p.isHit,
    })),
    newProducts: newProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      images: p.images,
      variants: p.variants,
      isNew: p.isNew,
    })),
    hitProducts: hitProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      images: p.images,
      variants: p.variants,
      isHit: p.isHit,
    })),
    reviews: reviews.map(r => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      title: r.title,
      text: r.text,
      images: r.images,
      product: r.product,
      createdAt: r.createdAt.toISOString(),
    })),
  }
}

export default async function HomePage() {
  const data = await getHomeData()
  const heroBanner = data.banners[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Banner */}
        {heroBanner && (
          <section className="container-custom py-6 md:py-8">
            <HeroBanner banner={heroBanner} />
          </section>
        )}

        {/* Categories */}
        <section className="container-custom py-16 md:py-24 mt-12 md:mt-20">
          <h2 className="section-title mb-8">Категории</h2>
          <CategoryGrid categories={data.categories} />
        </section>

        {/* Featured Products */}
        {data.featuredProducts.length > 0 && (
          <section className="container-custom py-16 md:py-24 mt-12 md:mt-20">
            <ProductGrid 
              products={data.featuredProducts} 
              title="Популярные товары"
            />
          </section>
        )}

        {/* Trade-in */}
        <LazySection className="container-custom py-16 md:py-24 mt-12 md:mt-20">
          <TradeInBlock />
        </LazySection>

        {/* New Products */}
        {data.newProducts.length > 0 && (
          <LazySection 
            className="container-custom py-16 md:py-24 mt-12 md:mt-20"
            fallback={<ProductGridSkeleton count={8} />}
          >
            <ProductGrid 
              products={data.newProducts} 
              title="Новинки"
            />
          </LazySection>
        )}

        {/* IMEI Check */}
        <LazySection className="container-custom py-16 md:py-24 mt-12 md:mt-20">
          <ImeiCheckBlock />
        </LazySection>

        {/* Hit Products */}
        {data.hitProducts.length > 0 && (
          <LazySection 
            className="container-custom py-16 md:py-24 mt-12 md:mt-20"
            fallback={<ProductGridSkeleton count={8} />}
          >
            <ProductGrid 
              products={data.hitProducts} 
              title="Хиты продаж"
            />
          </LazySection>
        )}

        {/* Features */}
        <LazySection className="container-custom pt-20 md:pt-32 pb-20 md:pb-32 mt-20 md:mt-40">
          <Features />
        </LazySection>

        {/* Пустое пространство для отступа */}
        <div className="h-16 md:h-24"></div>

        {/* SEO Text */}
        <section className="container-custom pt-0 pb-20 md:pb-32">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Интернет-магазин электроники TechStore
            </h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-4 text-sm md:text-base">
              <p>
                TechStore — это современный интернет-магазин электроники и гаджетов, предлагающий широкий ассортимент оригинальной техники от ведущих мировых производителей. В нашем каталоге представлены смартфоны Apple iPhone, Samsung Galaxy, ноутбуки MacBook, iPad, а также разнообразные аксессуары и устройства для умного дома.
              </p>
              <p>
                Мы гарантируем подлинность всех товаров и предоставляем официальную гарантию производителя. Наша команда специалистов поможет вам подобрать технику под ваши задачи и бюджет, а быстрая доставка обеспечит получение заказа в кратчайшие сроки.
              </p>
              <p>
                Воспользуйтесь услугой Trade-in и обменяйте старый смартфон на новый с выгодой до 50 000 рублей. Проверьте оригинальность любого устройства Apple по IMEI или серийному номеру на нашем сайте.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 md:mt-24">
        <Footer />
      </footer>
    </div>
  )
}
