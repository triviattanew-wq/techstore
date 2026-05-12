'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: string
  createdAt: string
  _count: { leads: number; favorites: number }
}

const roleLabels: Record<string, string> = {
  USER: 'Покупатель',
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  CONTENT_MANAGER: 'Контент-менеджер',
}

const roleColors: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-700',
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  CONTENT_MANAGER: 'bg-purple-100 text-purple-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')

  const loadUsers = useCallback(async (s = search, r = role, p = page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (s) params.set('search', s)
      if (r !== 'all') params.set('role', r)
      params.set('page', p.toString())

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
      setPages(data.pages)
      setPage(data.page)
    } catch {
      toast.error('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }, [search, role, page])

  useEffect(() => { loadUsers() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadUsers(search, role, 1)
  }

  const handleRoleChange = (r: string) => {
    setRole(r)
    setPage(1)
    loadUsers(search, r, 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <span className="text-sm text-gray-500">Всего: {total}</span>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени, email, телефону..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700">
            Найти
          </button>
        </form>

        <select
          value={role}
          onChange={e => handleRoleChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="all">Все роли</option>
          <option value="USER">Покупатели</option>
          <option value="ADMIN">Администраторы</option>
          <option value="MANAGER">Менеджеры</option>
          <option value="CONTENT_MANAGER">Контент-менеджеры</option>
        </select>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Загрузка...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Пользователи не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Контакты</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Роль</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Заявки</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Избранное</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Дата регистрации</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {(user.name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.name || <span className="text-gray-400 italic">Без имени</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{user.email || '—'}</div>
                      <div className="text-xs text-gray-400">{user.phone || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user._count.leads}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user._count.favorites}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Пагинация */}
        {pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">Страница {page} из {pages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => { const p = page - 1; setPage(p); loadUsers(search, role, p) }}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ←
              </button>
              <button
                onClick={() => { const p = page + 1; setPage(p); loadUsers(search, role, p) }}
                disabled={page >= pages}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
