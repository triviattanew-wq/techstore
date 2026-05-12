import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductInfo } from '@/components/ProductInfo'
import { ProductTabs } from '@/components/ProductTabs'
import { RelatedProducts } from '@/components/RelatedProducts'
import { ProductGrid } from '@/components/ProductGrid'

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      characteristics: { orderBy: { sortOrder: 'asc' } },
      brand: true,
      category: true,
      reviews: {
        where: { isPublished: true },
        include: { images: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      relatedFrom: {
        include: {
          related: {
            include: { images: { take: 1 } },
          },
        },
      },
    },
  })

  if (!product) return null

  // Increment view count
  await prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  })

  return product
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  
  if (!product) {
    return { title: 'Товар не найден' }
  }

  return {
    title: product.seoTitle || `${product.name} — купить в TechStore`,
    description: product.seoDesc || `Купить ${product.name} в TechStore. ${product.shortDesc || ''}`,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDesc || product.shortDesc,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  // Get related products
  const relatedProductIds = product.relatedFrom.map(r => r.relatedId)
  const relatedProducts = relatedProductIds.length > 0 
    ? await prisma.product.findMany({
        where: { id: { in: relatedProductIds }, isActive: true },
        include: { images: { take: 1 } },
        take: 8,
      }).then(products => products.map(p => ({
        ...p,
        price: Number(p.price),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      })))
    : []

  // Transform product for components
  const transformedProduct = {
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    variants: product.variants.map(v => ({
      ...v,
      price: v.price ? Number(v.price) : null,
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
    })),
  }

  // Get similar products from same category
  const similarProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: { images: { take: 1 } },
    take: 8,
  })

  // Schema.org structured data
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map(i => i.url),
    description: product.description || product.shortDesc,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name,
    },
    offers: {
      '@type': 'Offer',
      price: Number(product.price),
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
    },
    aggregateRating: product.reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length,
      reviewCount: product.reviews.length,
    } : undefined,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-custom py-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <a href="/" className="hover:text-gray-900">Главная</a>
              <span>/</span>
              <a href="/catalog" className="hover:text-gray-900">Каталог</a>
              {product.category && (
                <>
                  <span>/</span>
                  <a href={`/catalog/${product.category.slug}`} className="hover:text-gray-900">
                    {product.category.name}
                  </a>
                </>
              )}
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Detail */}
        <div className="container-custom py-6 md:py-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Info */}
            <ProductInfo product={transformedProduct} />
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <ProductTabs product={transformedProduct} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <ProductGrid 
                products={relatedProducts.map(p => ({
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  price: Number(p.price),
                  oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                  images: p.images,
                }))}
                title="С этим товаром покупают"
              />
            </div>
          )}

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mt-12">
              <ProductGrid 
                products={similarProducts.map(p => ({
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  price: Number(p.price),
                  oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                  images: p.images,
                }))}
                title="Похожие товары"
              />
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </div>
  )
}
