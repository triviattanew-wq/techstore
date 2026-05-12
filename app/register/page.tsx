'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Phone } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreement: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Введите имя (минимум 2 символа)'
    }
    
    if (!formData.email) {
      newErrors.email = 'Введите email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email'
    }
    
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Введите корректный номер телефона'
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать заглавную букву, строчную букву и цифру'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }
    
    if (!formData.agreement) {
      newErrors.agreement = 'Необходимо согласие на обработку персональных данных'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Регистрация прошла успешно! Теперь вы можете войти в аккаунт')
        router.push('/login')
      } else {
        if (data.details) {
          // Ошибки валидации Zod
          const newErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message
          })
          setErrors(newErrors)
        } else {
          toast.error(data.error || 'Произошла ошибка при регистрации')
        }
      }
    } catch (error) {
      toast.error('Произошла ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Регистрация</h1>
                <p className="text-gray-600">Создайте аккаунт для доступа к личному кабинету</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Имя *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.name ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Ваше имя"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Телефон</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.phone ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Пароль *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Подтвердите пароль *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.agreement}
                      onChange={(e) => setFormData({...formData, agreement: e.target.checked})}
                      className="mt-1 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">
                      Я согласен с{' '}
                      <Link href="/privacy" className="text-gray-900 hover:underline">
                        политикой конфиденциальности
                      </Link>{' '}
                      и{' '}
                      <Link href="/terms" className="text-gray-900 hover:underline">
                        пользовательским соглашением
                      </Link>
                    </span>
                  </label>
                  {errors.agreement && (
                    <p className="text-red-500 text-sm mt-1">{errors.agreement}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Уже есть аккаунт?{' '}
                  <Link href="/login" className="text-gray-900 font-medium hover:underline">
                    Войти
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}