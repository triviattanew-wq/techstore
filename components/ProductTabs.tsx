'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductTabsProps {
  product: {
    id: string
    description?: string | null
    warranty?: string | null
    deliveryInfo?: string | null
    characteristics: { name: string; value: string; group?: string | null }[]
    reviews: {
      id: string
      authorName: string
      rating: number
      title?: string | null
      text: string
      createdAt: Date
      images: { url: string }[]
    }[]
  }
}

const tabs = [
  { id: 'description', label: 'Описание' },
  { id: 'specs', label: 'Характеристики' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'delivery', label: 'Доставка и гарантия' },
]

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description')

  // Group characteristics
  const groupedSpecs = product.characteristics.reduce((acc, char) => {
    const group = char.group || 'Основные'
    if (!acc[group]) acc[group] = []
    acc[group].push(char)
    return acc
  }, {} as Record<string, typeof product.characteristics>)

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  return (
    <div>
      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-shrink-0 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
            {tab.id === 'reviews' && product.reviews.length > 0 && (
              <span className="ml-2 text-gray-400">({product.reviews.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Description */}
        {activeTab === 'description' && (
          <div className="prose prose-gray max-w-none">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p className="text-gray-500">Описание отсутствует</p>
            )}
          </div>
        )}

        {/* Specifications */}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            {Object.entries(groupedSpecs).map(([group, chars]) => (
              <div key={group}>
                <h3 className="font-medium text-gray-900 mb-3">{group}</h3>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  {chars.map((char, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "flex justify-between py-3 px-4",
                        i !== chars.length - 1 && "border-b border-gray-100"
                      )}
                    >
                      <span className="text-gray-600">{char.name}</span>
                      <span className="font-medium">{char.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {product.characteristics.length === 0 && (
              <p className="text-gray-500">Характеристики не указаны</p>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Rating Summary */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.round(avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {product.reviews.length} отзывов
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {product.reviews.map(review => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.authorName[0]}
                      </div>
                      <div>
                        <div className="font-medium">{review.authorName}</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium mb-1">{review.title}</h4>
                  )}
                  <p className="text-gray-600">{review.text}</p>
                  
                  {review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={`Фото ${i + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {product.reviews.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Отзывов пока нет. Будьте первым!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery & Warranty */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Доставка</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-gray-600">
                <p><strong>По Москве:</strong> 1-2 рабочих дня, от 300 ₽</p>
                <p><strong>По Московской области:</strong> 2-3 рабочих дня, от 500 ₽</p>
                <p><strong>По России:</strong> от 3 рабочих дней, от 500 ₽ (СДЭК, Почта России)</p>
                <p><strong>Самовывоз:</strong> бесплатно, м. Примерная</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Гарантия</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-gray-600">
                <p>{product.warranty || 'Официальная гарантия производителя — 1 год'}</p>
                <p>Гарантийное обслуживание в авторизованных сервисных центрах</p>
                <p>Возможность расширенной гарантии до 3 лет</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Возврат</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-gray-600">
                <p>Возврат товара надлежащего качества — 14 дней</p>
                <p>Возврат товара ненадлежащего качества — по гарантии</p>
                <p>Возврат технически сложных товаров — при наличии недостатков</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
