'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle?: string | null
  imageDesktop: string
  imageMobile?: string | null
  link?: string | null
  buttonText?: string | null
}

interface HeroBannerProps {
  banner: Banner
}

export function HeroBanner({ banner }: HeroBannerProps) {
  const content = (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl bg-gray-900">
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.imageDesktop}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-20">
        <div className="max-w-xl">
          {banner.subtitle && (
            <p className="text-primary-300 text-sm md:text-base font-medium mb-2 md:mb-4">
              {banner.subtitle}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
            {banner.title}
          </h1>
          {banner.buttonText && (
            <Link
              href={banner.link || '#'}
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              {banner.buttonText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  if (banner.link && !banner.buttonText) {
    return <Link href={banner.link}>{content}</Link>
  }

  return content
}
