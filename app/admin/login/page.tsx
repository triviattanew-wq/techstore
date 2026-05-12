'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Простая проверка для демо
      if (credentials.email === 'admin@techstore.ru' && credentials.password === 'admin123') {
        // Безопасное сохранение в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_logged_in', 'true')
          setMessage('Успешный вход! Перенаправление...')
          
          // Используем setTimeout для перенаправления
          setTimeout(() => {
            router.push('/admin')
          }, 1000)
        }
      } else {
        setMessage('Неверные данные для входа')
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage('Ошибка при входе в систему')
    } finally {
      setLoading(false)
    }
  }, [credentials, router])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({ ...prev, email: e.target.value }))
  }, [])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({ ...prev, password: e.target.value }))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Вход в админ-панель</h1>
          <p className="text-gray-500 mt-2">TechStore</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={handleEmailChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="admin@techstore.ru"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Пароль</label>
            <input
              type="password"
              value={credentials.password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Вход...
              </span>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
            message.includes('Успешный') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Данные для входа:</p>
          <p className="text-sm font-mono text-gray-800">Email: admin@techstore.ru</p>
          <p className="text-sm font-mono text-gray-800">Пароль: admin123</p>
        </div>
      </div>
    </div>
  )
}