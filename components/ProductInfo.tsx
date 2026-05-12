'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Scale, Share2, Check, ShoppingCart } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import toast from 'react-hot-toast'

interface ProductInfoProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    oldPrice: number | null
    sku?: string | null
    brand?: { name: string } | null
    warranty?: string | null
    shortDesc?: string | null
    images: { url: string }[]
    variants: {
      id: string
      color?: string | null
      colorCode?: string | null
      memory?: string | null
      simType?: string | null
      price?: number | null
      oldPrice?: number | null
      sku?: string | null
      stock: number
    }[]
    characteristics: { name: string; value: string; group?: string | null }[]
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id || null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showOneClick, setShowOneClick] = useState(false)

  const selectedVariantData = product.variants.find(v => v.id === selectedVariant)
  const currentPrice = selectedVariantData?.price || product.price
  const currentOldPrice = selectedVariantData?.oldPrice || product.oldPrice
  const hasDiscount = currentOldPrice && Number(currentOldPrice) > Number(currentPrice)
  const discountPercent = hasDiscount 
    ? Math.round((1 - Number(currentPrice) / Number(currentOldPrice!)) * 100) 
    : 0
  const inStock = (selectedVariantData?.stock ?? 0) > 0

  // Get unique colors and memories
  const uniqueColors = product.variants
    .filter(v => v.color)
    .reduce((acc, v) => {
      const existing = acc.find(c => c.color === v.color)
      if (!existing) {
        acc.push({
          color: v.color!,
          colorCode: v.colorCode || null,
          id: v.id,
        })
      }
      return acc
    }, [] as Array<{ color: string; colorCode: string | null; id: string }>)
  
  const uniqueMemories = Array.from(new Set(
    product.variants.filter(v => v.memory).map(v => v.memory!)
  ))

  const uniqueSimTypes = Array.from(new Set(
    product.variants.filter(v => v.simType).map(v => v.simType!)
  ))

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await addItem(product.id, 1, selectedVariant || undefined)
      toast.success('Товар добавлен в корзину')
    } catch (error) {
      toast.error('Ошибка при добавлении')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleOneClick = async (data: { name: string; phone: string }) => {
    try {
      const res = await fetch('/api/one-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          productId: product.id,
          variantId: selectedVariant,
          quantity: 1,
        }),
      })
      
      if (res.ok) {
        toast.success('Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
        setShowOneClick(false)
      }
    } catch (error) {
      toast.error('Ошибка при отправке заявки')
    }
  }

  return (
    <div className="space-y-6">
      {/* Name & Brand */}
      <div>
        {product.brand && (
          <p className="text-sm text-gray-500 mb-1">{product.brand.name}</p>
        )}
        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
        {hasDiscount && (
          <>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(currentOldPrice!)}
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Variants */}
      {product.variants.length > 0 && (
        <div className="space-y-4">
          {/* Memory */}
          {uniqueMemories.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Память</p>
              <div className="flex flex-wrap gap-2">
                {uniqueMemories.map(memory => (
                  <button
                    key={memory}
                    onClick={() => {
                      const variant = product.variants.find(v => v.memory === memory)
                      if (variant) setSelectedVariant(variant.id)
                    }}
                    className={cn(
                      "px-4 py-2 text-sm rounded-lg border transition-colors",
                      product.variants.find(v => v.memory === memory && v.id === selectedVariant)
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {memory}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {uniqueColors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Цвет</p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map(({ color, colorCode, id }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedVariant(id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors",
                      id === selectedVariant
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {colorCode && (
                      <span 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: colorCode }}
                      />
                    )}
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIM Type */}
          {uniqueSimTypes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Тип SIM</p>
              <div className="flex flex-wrap gap-2">
                {uniqueSimTypes.map(simType => (
                  <button
                    key={simType}
                    onClick={() => {
                      const variant = product.variants.find(v => v.simType === simType)
                      if (variant) setSelectedVariant(variant.id)
                    }}
                    className={cn(
                      "px-4 py-2 text-sm rounded-lg border transition-colors",
                      product.variants.find(v => v.simType === simType && v.id === selectedVariant)
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {simType}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {inStock ? (
          <>
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-600 font-medium">В наличии</span>
          </>
        ) : (
          <span className="text-gray-400">Нет в наличии</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || isAddingToCart}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          Добавить в корзину
        </button>
        <button
          onClick={() => setShowOneClick(true)}
          disabled={!inStock}
          className="flex-1 py-3.5 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Купить в 1 клик
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <Heart className="w-5 h-5" />
          В избранное
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <Scale className="w-5 h-5" />
          Сравнить
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <Share2 className="w-5 h-5" />
          Поделиться
        </button>
      </div>

      {/* Short Description */}
      {product.shortDesc && (
        <p className="text-gray-600">{product.shortDesc}</p>
      )}

      {/* Additional Info */}
      <div className="space-y-2 text-sm">
        {product.sku && (
          <div className="flex justify-between">
            <span className="text-gray-500">Артикул:</span>
            <span>{product.sku}</span>
          </div>
        )}
        {product.warranty && (
          <div className="flex justify-between">
            <span className="text-gray-500">Гарантия:</span>
            <span>{product.warranty}</span>
          </div>
        )}
      </div>

      {/* Delivery Info */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium">Доставка</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• По Москве — 1-2 дня, от 300 ₽</p>
          <p>• По России — от 3 дней, от 500 ₽</p>
          <p>• Самовывоз — бесплатно</p>
        </div>
      </div>

      {/* One Click Modal */}
      {showOneClick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Купить в 1 клик</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleOneClick({
                  name: formData.get('name') as string,
                  phone: formData.get('phone') as string,
                })
              }}
              className="space-y-4"
            >
              <input 
                type="text" 
                name="name" 
                placeholder="Ваше имя"
                required
                minLength={2}
                className="input-field"
              />
              <input 
                type="tel" 
                name="phone" 
                placeholder="Телефон"
                required
                className="input-field"
              />
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" required className="mt-1" />
                <span className="text-gray-600">
                  Согласен с{' '}
                  <a href="/privacy" className="text-primary-600 hover:underline">
                    политикой обработки персональных данных
                  </a>
                </span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOneClick(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-full"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gray-900 text-white rounded-full"
                >
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
