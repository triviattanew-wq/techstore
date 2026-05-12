'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle?: string | null
  imageDesktop: string
  imageMobile?: string | null
  link?: string | null
  buttonText?: string | null
}

interface PromoSliderProps {
  banners: Banner[]
  autoPlayInterval?: number
}

export function PromoSlider({ banners, autoPlayInterval = 5000 }: PromoSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (autoPlayInterval > 0 && banners.length > 1) {
      const timer = setInterval(nextSlide, autoPlayInterval)
      return () => clearInterval(timer)
    }
  }, [autoPlayInterval, nextSlide, banners.length])

  if (banners.length === 0) return null

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            <Link href={banner.link || '#'} className="block relative h-[200px] md:h-[300px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.imageDesktop}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
                {banner.subtitle && (
                  <p className="text-primary-300 text-xs md:text-sm font-medium mb-1 md:mb-2">
                    {banner.subtitle}
                  </p>
                )}
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-4">
                  {banner.title}
                </h2>
                {banner.buttonText && (
                  <span className="inline-flex items-center gap-2 text-white text-sm md:text-base font-medium">
                    {banner.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors" aria-label="Предыдущий слайд">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors" aria-label="Следующий слайд">
            <ChevronRight className="w-5 h-5 text-gray-900" />
          </button>
        </>
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
