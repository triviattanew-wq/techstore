'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, User, Package, Heart, Scale, ArrowLeft, Sun, Moon, Monitor } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/lib/theme-context'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login?callbackUrl=/settings')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container-custom">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Светлая тема', description: 'Классический светлый интерфейс' },
    { value: 'dark', icon: Moon, label: 'Темная тема', description: 'Темный интерфейс для комфорта глаз' },
    { value: 'system', icon: Monitor, label: 'Системная', description: 'Следует настройкам системы' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад в профиль
              </Link>
              <h1 className="text-3xl font-bold mb-2 dark-text">Настройки</h1>
              <p className="dark-text-muted">Персонализируйте свой опыт использования</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="dark-card rounded-2xl p-6">
                  <nav className="space-y-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Профиль
                    </Link>
                    <Link
                      href="/profile/orders"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Package className="w-5 h-5" />
                      Мои заявки
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      Избранное
                    </Link>
                    <Link
                      href="/compare"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Scale className="w-5 h-5" />
                      Сравнение
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 text-gray-900"
                    >
                      <Settings className="w-5 h-5" />
                      Настройки
                    </Link>
                  </nav>
                </div>
              </div>

              {/* Settings */}
              <div className="lg:col-span-3 space-y-6">
                {/* Theme settings */}
                <div className="dark-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4 dark-text">Тема оформления</h2>
                  <p className="text-gray-600 mb-6">
                    Выберите тему, которая вам больше нравится
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {themes.map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value as any)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          theme === themeOption.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            theme === themeOption.value
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <themeOption.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium dark-text">{themeOption.label}</h3>
                            {theme === themeOption.value && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full mt-1" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {themeOption.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="dark-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4 dark-text">Уведомления</h2>
                  <p className="text-gray-600 mb-6">
                    Управляйте способами получения уведомлений
                  </p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium dark-text">Email уведомления</h3>
                        <p className="text-sm text-gray-600">
                          Получать уведомления о статусе заказов на email
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium dark-text">SMS уведомления</h3>
                        <p className="text-sm text-gray-600">
                          Получать SMS о важных обновлениях заказов
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium dark-text">Маркетинговые рассылки</h3>
                        <p className="text-sm text-gray-600">
                          Получать информацию о скидках и новинках
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                    </label>
                  </div>
                </div>

                {/* Privacy */}
                <div className="dark-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4 dark-text">Приватность</h2>
                  <p className="text-gray-600 mb-6">
                    Настройки конфиденциальности и безопасности
                  </p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium dark-text">Показывать мои отзывы</h3>
                        <p className="text-sm text-gray-600">
                          Разрешить другим пользователям видеть мои отзывы
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium dark-text">Аналитика использования</h3>
                        <p className="text-sm text-gray-600">
                          Помочь улучшить сервис, отправляя анонимные данные
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                    </label>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="dark-card rounded-2xl p-6 border-red-200">
                  <h2 className="text-xl font-semibold mb-4 text-red-600">Опасная зона</h2>
                  <p className="text-gray-600 mb-6">
                    Необратимые действия с вашим аккаунтом
                  </p>
                  
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Удалить аккаунт
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Это действие нельзя отменить. Все ваши данные будут удалены.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}