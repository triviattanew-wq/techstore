'use client'

import Link from 'next/link'
import { useState, memo } from 'react'
import { Heart, ShoppingCart, Scale, Check } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import { OptimizedImage } from './OptimizedImage'

interface ProductCardProps {
  product: {
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
  showQuickBuy?: boolean
  priority?: boolean
}

export const ProductCard = memo(function ProductCard({ product, showQuickBuy = true, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)

  const mainImage = product.images[0]?.url || '/placeholder.jpg'
  const secondImage = product.images[1]?.url
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price)
  const discountPercent = hasDiscount 
    ? Math.round((1 - Number(product.price) / Number(product.oldPrice!)) * 100) 
    : 0
  const inStock = (product.stock ?? product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0) > 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAddingToCart || addedToCart) return
    setIsAddingToCart(true)
    
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      
      if (res.ok) {
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAddingToWishlist) return
    setIsAddingToWishlist(true)
    
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Compare functionality
  }

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="badge badge-new">Новинка</span>
        )}
        {product.isHit && (
          <span className="badge badge-hit">Хит</span>
        )}
        {hasDiscount && discountPercent > 0 && (
          <span className="badge badge-sale">-{discountPercent}%</span>
        )}
      </div>

      {/* Wishlist & Compare buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleAddToWishlist}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          title="В избранное"
        >
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={handleCompare}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          title="Сравнить"
        >
          <Scale className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative bg-white" style={{ paddingBottom: '110%' }}>
        <OptimizedImage
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-3"
          priority={priority}
          quality={85}
        />
      </Link>

      {/* Info */}
      <div className="p-4">
        {/* Name */}
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 hover:text-primary-600">
            {product.name}
          </h3>
        </Link>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {product.variants.slice(0, 4).map((variant, idx) => (
              <span
                key={idx}
                className={cn(
                  "text-xs text-gray-500",
                  !variant.stock && "line-through opacity-50"
                )}
              >
                {variant.memory || variant.color}
              </span>
            ))}
            {product.variants.length > 4 && (
              <span className="text-xs text-gray-400">+{product.variants.length - 4}</span>
            )}
          </div>
        )}

        {/* Price & Stock */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-semibold">
              {formatPrice(product.price)}
            </div>
            {hasDiscount && (
              <div className="text-sm text-gray-400 line-through">
                {formatPrice(product.oldPrice!)}
              </div>
            )}
          </div>
          {!inStock && (
            <span className="text-xs text-gray-400">Нет в наличии</span>
          )}
        </div>

        {/* Actions */}
        {showQuickBuy && inStock && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || addedToCart}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-colors",
                addedToCart 
                  ? "bg-green-500 text-white"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              )}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  Добавлено
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  В корзину
                </>
              )}
            </button>
          </div>
        )}

        {!showQuickBuy && inStock && (
          <button className="btn-secondary btn-sm w-full mt-3">
            Купить в 1 клик
          </button>
        )}
      </div>
    </div>
  )
})
