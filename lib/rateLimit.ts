import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function getClientIp(request?: NextRequest): string {
  if (request) {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    if (forwarded) return forwarded.split(',')[0].trim()
    if (realIp) return realIp
  }
  return 'unknown'
}

export function getUserAgent(request?: NextRequest): string {
  if (request) {
    return request.headers.get('user-agent') || 'unknown'
  }
  return 'unknown'
}

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  key?: string
}

export function rateLimit(options: RateLimitOptions): {
  success: boolean
  remaining: number
  resetTime: number
} {
  const { windowMs, maxRequests, key = 'default' } = options
  
  const now = Date.now()
  const record = store[key]
  
  if (!record || now > record.resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }
  
  if (record.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }
  
  record.count++
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  }, 5 * 60 * 1000)
}

// Form-specific rate limiters
export function checkFormRateLimit(identifier: string): boolean {
  const result = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3,
    key: `form:${identifier}`,
  })
  return result.success
}

export function checkApiRateLimit(identifier: string): boolean {
  const result = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    key: `api:${identifier}`,
  })
  return result.success
}

export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Handle Russian phone numbers
  if (digits.startsWith('8') && digits.length === 11) {
    return '+7' + digits.slice(1)
  }
  if (digits.startsWith('7') && digits.length === 11) {
    return '+' + digits
  }
  if (digits.length === 10) {
    return '+7' + digits
  }
  
  // Return as is for other formats
  return '+' + digits
}
