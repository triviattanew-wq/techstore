import { useState, useEffect } from 'react'

// Simple in-memory cache for client-side caching
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()
  private maxSize = 100

  set(key: string, data: any, ttlMs = 5 * 60 * 1000) { // 5 minutes default
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    })
  }

  get(key: string) {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, entry] of entries) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }
}

export const memoryCache = new MemoryCache()

// Clean up expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup()
  }, 5 * 60 * 1000)
}

// Browser storage cache utilities
export const storageCache = {
  set(key: string, data: any, ttlMs = 30 * 60 * 1000) { // 30 minutes default
    if (typeof window === 'undefined') return

    const item = {
      data,
      expires: Date.now() + ttlMs
    }

    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error)
    }
  },

  get(key: string) {
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(`cache:${key}`)
      if (!item) return null

      const parsed = JSON.parse(item)
      
      if (Date.now() > parsed.expires) {
        localStorage.removeItem(`cache:${key}`)
        return null
      }

      return parsed.data
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error)
      return null
    }
  },

  delete(key: string) {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`cache:${key}`)
  },

  clear() {
    if (typeof window === 'undefined') return
    
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cache:')) {
        localStorage.removeItem(key)
      }
    })
  }
}

// API response caching wrapper
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  const key = cacheKey || `fetch:${url}:${JSON.stringify(options)}`
  
  // Try memory cache first
  const cached = memoryCache.get(key)
  if (cached) {
    return cached
  }

  // Try storage cache
  const storageCached = storageCache.get(key)
  if (storageCached) {
    // Also set in memory cache for faster access
    memoryCache.set(key, storageCached, ttlMs)
    return storageCached
  }

  // Fetch from network
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Cache the response
    memoryCache.set(key, data, ttlMs)
    storageCache.set(key, data, ttlMs)
    
    return data
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

// React hook for cached API calls
export function useCachedFetch<T>(
  url: string | null,
  options: RequestInit = {},
  cacheKey?: string,
  ttlMs = 5 * 60 * 1000
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await cachedFetch<T>(url, options, cacheKey, ttlMs)
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, cacheKey, ttlMs])

  return { data, loading, error }
}