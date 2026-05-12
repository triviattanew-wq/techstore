'use client'

import { memo, useMemo } from 'react'
import { ProductCard } from './ProductCard'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice: number | null
  images: { url: string; alt?: string | null }[]
  variants?: { color?: string | null; colorCode?: string | null; memory?: string | null; stock: number }[]
  isNew?: boolean
  isHit?: boolean
  stock?: number
}

interface ProductGridProps {
  products: Product[]
  title?: string
  showQuickBuy?: boolean
  columns?: 2 | 3 | 4 | 5
}

export const ProductGrid = memo(function ProductGrid({ products, title, showQuickBuy = true, columns = 4 }: ProductGridProps) {
  const gridCols = useMemo(() => ({
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  }), [])

  // Проверяем что products является массивом
  if (!Array.isArray(products)) {
    console.error('ProductGrid: products is not an array:', products)
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Товары не найдены</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Товары не найдены</p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h2 className="section-title mb-6">{title}</h2>
      )}
      <div className={`grid ${gridCols[columns]} gap-3 md:gap-4 lg:gap-5`}>
        {products.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            showQuickBuy={showQuickBuy}
            priority={index < 4}
          />
        ))}
      </div>
    </div>
  )
})
