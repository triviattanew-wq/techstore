'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Загружаем тему из localStorage только на клиенте
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = window.document.documentElement

    // Определяем итоговую тему
    let finalTheme: 'light' | 'dark' = 'light'
    
    if (theme === 'system') {
      finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      finalTheme = theme as 'light' | 'dark'
    }

    setResolvedTheme(finalTheme)

    // Применяем тему
    root.classList.remove('light', 'dark')
    root.classList.add(finalTheme)

    // Сохраняем в localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Слушаем изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(newResolvedTheme)
        
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(newResolvedTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}