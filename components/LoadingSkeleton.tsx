'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'product' | 'text' | 'image' | 'button'
  count?: number
}

export const LoadingSkeleton = memo(function LoadingSkeleton({ 
  className, 
  variant = 'text', 
  count = 1 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-dark-200 rounded'
  
  const variants = {
    product: 'aspect-square',
    text: 'h-4',
    image: 'aspect-video',
    button: 'h-10'
  }

  if (count === 1) {
    return (
      <div className={cn(baseClasses, variants[variant], className)} />
    )
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(baseClasses, variants[variant], className)} />
      ))}
    </>
  )
})

export const ProductCardSkeleton = memo(function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden p-4 space-y-4">
      <LoadingSkeleton variant="product" />
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-6 w-20" />
        <LoadingSkeleton className="h-4 w-16" />
      </div>
      <LoadingSkeleton variant="button" />
    </div>
  )
})

export const ProductGridSkeleton = memo(function ProductGridSkeleton({ 
  count = 8, 
  columns = 4 
}: { 
  count?: number
  columns?: 2 | 3 | 4 | 5 
}) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-3 md:gap-4 lg:gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
})