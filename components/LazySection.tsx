'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { LoadingSkeleton } from './LoadingSkeleton'

interface LazySectionProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  threshold?: number
  className?: string
}

export function LazySection({ 
  children, 
  fallback, 
  rootMargin = '100px',
  threshold = 0.1,
  className 
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold, hasLoaded])

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <LoadingSkeleton className="h-64" />)}
    </div>
  )
}