'use client'

import { useEffect } from 'react'

interface ImagePreloaderProps {
  images: string[]
  priority?: boolean
}

export function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    if (!priority && typeof window !== 'undefined') {
      // Preload images when browser is idle
      const preloadImages = () => {
        images.forEach((src) => {
          const img = new Image()
          img.src = src
        })
      }

      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadImages)
      } else {
        setTimeout(preloadImages, 100)
      }
    } else if (priority) {
      // Preload immediately for priority images
      images.forEach((src) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = src
        document.head.appendChild(link)
      })
    }
  }, [images, priority])

  return null
}

// Hook for preloading images
export function useImagePreloader(images: string[], priority = false) {
  useEffect(() => {
    if (!images.length) return

    const preloadImages = () => {
      images.forEach((src) => {
        if (priority) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = src
          document.head.appendChild(link)
        } else {
          const img = new Image()
          img.src = src
        }
      })
    }

    if (priority) {
      preloadImages()
    } else if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadImages)
    } else {
      setTimeout(preloadImages, 100)
    }
  }, [images, priority])
}