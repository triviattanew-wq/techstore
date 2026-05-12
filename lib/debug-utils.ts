// Утилиты для отладки runtime ошибок

export function safeCall<T>(fn: () => T, fallback: T, context?: string): T {
  try {
    return fn()
  } catch (error) {
    console.error(`Safe call failed${context ? ` in ${context}` : ''}:`, error)
    return fallback
  }
}

export function debugComponent(name: string, props?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Rendering component: ${name}`, props)
  }
}

export function logError(error: Error, context?: string) {
  console.error(`❌ Error${context ? ` in ${context}` : ''}:`, {
    message: error.message,
    stack: error.stack,
    name: error.name
  })
}

// Безопасная проверка на клиентскую среду
export const isClient = typeof window !== 'undefined'

// Безопасная работа с localStorage
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isClient) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): boolean => {
    if (!isClient) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  removeItem: (key: string): boolean => {
    if (!isClient) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}