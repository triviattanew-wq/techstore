import React from 'react'

// HOC для безопасной работы с массивами
export function withSafeArray<T extends { [key: string]: any }>(
  Component: React.ComponentType<T>,
  arrayPropName: keyof T,
  fallbackComponent?: React.ComponentType
) {
  return function SafeArrayComponent(props: T) {
    const arrayProp = props[arrayPropName]
    
    if (!Array.isArray(arrayProp)) {
      console.error(`${Component.name}: ${String(arrayPropName)} is not an array:`, arrayProp)
      
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent
        return <FallbackComponent {...props} />
      }
      
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Данные не найдены</p>
        </div>
      )
    }
    
    if (arrayProp.length === 0) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent
        return <FallbackComponent {...props} />
      }
      
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Данные не найдены</p>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}

// Утилита для безопасной работы с объектами
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue
      }
      result = result[key]
    }
    
    return result !== undefined ? result : defaultValue
  } catch {
    return defaultValue
  }
}

// Утилита для безопасной работы с массивами
export function safeArray<T>(arr: any, defaultValue: T[] = []): T[] {
  return Array.isArray(arr) ? arr : defaultValue
}

// Утилита для безопасного вызова функций
export function safeCall<T>(fn: (() => T) | undefined | null, defaultValue: T): T {
  try {
    return fn ? fn() : defaultValue
  } catch {
    return defaultValue
  }
}

// Компонент для безопасного рендеринга
interface SafeRenderProps {
  condition: any
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function SafeRender({ condition, fallback = null, children }: SafeRenderProps) {
  if (!condition) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Hook для безопасной работы с состоянием
export function useSafeState<T>(initialValue: T) {
  const [state, setState] = React.useState<T>(initialValue)
  
  const safeSetState = React.useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      setState(newValue)
    } catch (error) {
      console.error('Error in setState:', error)
      setState(initialValue)
    }
  }, [initialValue])
  
  return [state, safeSetState] as const
}