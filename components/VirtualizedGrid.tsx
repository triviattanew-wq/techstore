'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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

interface VirtualizedGridProps {
  products: Product[]
  itemHeight?: number
  containerHeight?: number
  columns?: number
  gap?: number
}

export function VirtualizedGrid({
  products,
  itemHeight = 400,
  containerHeight = 800,
  columns = 4,
  gap = 16
}: VirtualizedGridProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const itemsPerRow = columns
  const totalRows = Math.ceil(products.length / itemsPerRow)
  const rowHeight = itemHeight + gap

  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / rowHeight)
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / rowHeight) + 1,
      totalRows
    )
    
    return {
      start: Math.max(0, startRow - 1),
      end: endRow
    }
  }, [scrollTop, rowHeight, containerHeight, totalRows])

  const visibleItems = useMemo(() => {
    const items = []
    for (let row = visibleRange.start; row < visibleRange.end; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col
        if (index < products.length) {
          items.push({
            product: products[index],
            index,
            row,
            col,
            top: row * rowHeight,
            left: col * (100 / itemsPerRow)
          })
        }
      }
    }
    return items
  }, [products, visibleRange, itemsPerRow, rowHeight])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  if (products.length <= 20) {
    // For small lists, use regular grid
    return (
      <div className={`grid grid-cols-${columns} gap-4`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{ height: totalRows * rowHeight }}
      >
        {visibleItems.map(({ product, index, top, left }) => (
          <div
            key={`${product.id}-${index}`}
            className="absolute"
            style={{
              top,
              left: `${left}%`,
              width: `${100 / itemsPerRow - (gap / itemsPerRow / 10)}%`,
              height: itemHeight
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}