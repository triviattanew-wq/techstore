'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageItem {
  id: string
  url: string
  alt?: string | null
}

interface ProductGalleryProps {
  images: ImageItem[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400">Нет изображения</span>
      </div>
    )
  }

  const mainImage = images[currentIndex]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative bg-white rounded-2xl overflow-hidden cursor-zoom-in"
        style={{ paddingBottom: '115%' }}
        onClick={() => setIsZoomed(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage.url}
          alt={mainImage.alt || productName}
          className="absolute inset-0 w-full h-full object-contain p-4"
          loading="eager"
        />
        <button
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); setIsZoomed(true) }}
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => (i - 1 + images.length) % images.length) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => (i + 1) % images.length) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative w-16 h-20 md:w-20 md:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors bg-white",
                index === currentIndex ? "border-gray-900" : "border-gray-200 hover:border-gray-400"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          <button className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20" onClick={() => setIsZoomed(false)}>
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-3xl max-h-[90vh] flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage.url}
              alt={mainImage.alt || productName}
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(index) }}
                  className={cn("w-2 h-2 rounded-full transition-colors", index === currentIndex ? "bg-white" : "bg-white/50")}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
