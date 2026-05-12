'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="theme-toggle">
        <Sun className="w-5 h-5" />
      </button>
    )
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Светлая' },
    { value: 'dark', icon: Moon, label: 'Темная' },
    { value: 'system', icon: Monitor, label: 'Системная' },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  return (
    <div className="relative group">
      <button className="theme-toggle">
        <currentTheme.icon className="w-5 h-5" />
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-100 rounded-xl shadow-lg border border-gray-200 dark:border-dark-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 dark:text-dark-500 px-3 py-2">
            Тема оформления
          </div>
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                theme === themeOption.value
                  ? 'bg-gray-100 dark:bg-dark-200 text-gray-900 dark:text-dark-900'
                  : 'text-gray-600 dark:text-dark-600 hover:bg-gray-50 dark:hover:bg-dark-200'
              }`}
            >
              <themeOption.icon className="w-4 h-4" />
              {themeOption.label}
              {theme === themeOption.value && (
                <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}