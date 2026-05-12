'use client'

import { useEffect, useCallback, useRef } from 'react'

// Debounce hook for performance optimization
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

// Throttle hook for performance optimization
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    },
    [callback, delay]
  ) as T

  return throttledCallback
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const { threshold = 0.1, rootMargin = '0px' } = options
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('in-view')
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', (entry as any).processingStart - entry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            console.log('CLS:', (entry as any).value)
          }
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      console.log('Performance monitoring not fully supported')
    }

    return () => {
      observer.disconnect()
    }
  }, [])
}

// Memory usage monitoring
export function useMemoryMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) return

    const checkMemory = () => {
      const memory = (performance as any).memory
      if (memory) {
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        })
      }
    }

    const interval = setInterval(checkMemory, 30000) // Check every 30 seconds

    return () => {
      clearInterval(interval)
    }
  }, [])
}