'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Package, Heart, Scale, Settings, Edit, Save, X } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login?callbackUrl=/profile')
      return
    }

    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
        })
      } else {
        toast.error('Ошибка при загрузке профиля')
      }
    } catch (error) {
      toast.error('Ошибка при загрузке профиля')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const updatedProfile = await res.json()
        setProfile(updatedProfile)
        setEditing(false)
        toast.success('Профиль обновлен')
        
        // Обновляем сессию
        await update({
          name: updatedProfile.name,
        })
      } else {
        const error = await res.json()
        toast.error(error.error || 'Ошибка при обновлении профиля')
      }
    } catch (error) {
      toast.error('Ошибка при обновлении профиля')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
    })
    setEditing(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 dark:bg-dark-50 py-12">
          <div className="container-custom">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-dark-900"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 dark:bg-dark-50 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 dark-text">Личный кабинет</h1>
              <p className="dark-text-muted">Управляйте своим профилем и заказами</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="dark-card rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400 dark:text-dark-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold dark-text">{profile?.name}</h2>
                      <p className="text-sm dark-text-muted">{profile?.email}</p>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-200 text-gray-900 dark:text-dark-900"
                    >
                      <User className="w-5 h-5" />
                      Профиль
                    </Link>
                    <Link
                      href="/profile/orders"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Package className="w-5 h-5" />
                      Мои заявки
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      Избранное
                    </Link>
                    <Link
                      href="/compare"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Scale className="w-5 h-5" />
                      Сравнение
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      Настройки
                    </Link>
                  </nav>
                </div>
              </div>

              {/* Main content */}
              <div className="lg:col-span-2">
                <div className="dark-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold dark-text">Информация профиля</h2>
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900"
                      >
                        <Edit className="w-4 h-4" />
                        Редактировать
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-dark-600 hover:text-gray-900 dark:hover:text-dark-900"
                        >
                          <X className="w-4 h-4" />
                          Отмена
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark-text">Имя</label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 border dark-border rounded-xl bg-white dark:bg-dark-100 dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 dark:bg-dark-200 rounded-xl dark-text">
                          {profile?.name || 'Не указано'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark-text">Email</label>
                      <p className="px-4 py-3 bg-gray-50 dark:bg-dark-200 rounded-xl dark-text">
                        {profile?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-500 mt-1">
                        Email нельзя изменить
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark-text">Телефон</label>
                      {editing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+7 (999) 123-45-67"
                          className="w-full px-4 py-3 border dark-border rounded-xl bg-white dark:bg-dark-100 dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 dark:bg-dark-200 rounded-xl dark-text">
                          {profile?.phone || 'Не указан'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark-text">Дата регистрации</label>
                      <p className="px-4 py-3 bg-gray-50 dark:bg-dark-200 rounded-xl dark-text">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ru-RU') : 'Не указана'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Link
                    href="/profile/orders"
                    className="dark-card rounded-2xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold dark-text">Мои заявки</h3>
                        <p className="text-sm dark-text-muted">История заказов</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/favorites"
                    className="dark-card rounded-2xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold dark-text">Избранное</h3>
                        <p className="text-sm dark-text-muted">Понравившиеся товары</p>
                      </div>
                    </div>
                  </Link>
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