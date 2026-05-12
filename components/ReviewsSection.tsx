'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Review {
  id: string
  authorName: string
  rating: number
  title?: string | null
  text: string
  images?: { url: string }[]
  product?: {
    name: string
    slug: string
  }
  createdAt: string
}

interface ReviewsSectionProps {
  reviews: Review[]
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const visibleCount = 3
  const maxIndex = Math.max(0, reviews.length - visibleCount)

  const next = () => setCurrentIndex((i) => Math.min(i + 1, maxIndex))
  const prev = () => setCurrentIndex((i) => Math.max(i - 1, 0))

  if (reviews.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Отзывы покупателей</h2>
        {reviews.length > visibleCount && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 gap-4"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="flex-shrink-0 w-full md:w-[calc(33.333%-12px)] bg-gray-50 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {review.authorName[0]}
                </div>
                <div>
                  <div className="font-medium">{review.authorName}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {review.title && (
                <p className="font-medium mb-2">{review.title}</p>
              )}
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {review.text}
              </p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.images.slice(0, 3).map((img, i) => (
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

              {review.product && (
                <a 
                  href={`/product/${review.product.slug}`}
                  className="text-sm text-primary-600 hover:underline"
                >
                  {review.product.name}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
