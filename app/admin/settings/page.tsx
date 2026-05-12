'use client'

import { useEffect, useState } from 'react'
import { Settings, Globe, Mail, Shield, Database } from 'lucide-react'

interface SiteSettings {
  siteName: string
  siteUrl: string
  adminEmail: string
  nodeEnv: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(setSettings)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Настройки</h1>

      <div className="grid grid-cols-1 gap-6 max-w-3xl">

        {/* Основные */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Основные</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название магазина</label>
              <input
                type="text"
                defaultValue={settings?.siteName || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL сайта</label>
              <input
                type="text"
                defaultValue={settings?.siteUrl || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Администратор */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Администратор</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email администратора</label>
            <input
              type="text"
              defaultValue={settings?.adminEmail || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        {/* Безопасность */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Безопасность</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Хеширование паролей</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">bcrypt</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Аутентификация</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">NextAuth</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Валидация данных</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Zod</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Среда выполнения</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                settings?.nodeEnv === 'production'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {settings?.nodeEnv || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* База данных */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">База данных</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">СУБД</span>
              <span className="font-medium text-gray-900">PostgreSQL 15</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">ORM</span>
              <span className="font-medium text-gray-900">Prisma</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Хост</span>
              <span className="font-medium text-gray-900">localhost:5432</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
