'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, Users, TrendingUp, Clock } from 'lucide-react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

interface Stats {
  productsCount: number
  activeProductsCount: number
  leadsCount: number
  newLeadsCount: number
  reviewsCount: number
  pendingReviewsCount: number
}

interface Lead {
  id: string
  name: string
  phone: string
  status: string
  createdAt: string
  items: Array<{
    product?: { name: string }
  }>
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  CONFIRMED: 'Подтверждена',
  CANCELLED: 'Отменена',
  COMPLETED: 'Завершена',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Загружаем статистику и последние заявки параллельно
        const [statsResponse, leadsResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/leads?limit=5')
        ])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json()
          setRecentLeads(leadsData.leads || [])
        }
      } catch (error) {
        console.error('Dashboard data load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-32" />
        
        {/* Stats skeleton */}
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <LoadingSkeleton className="w-12 h-12 rounded-lg" />
                <LoadingSkeleton className="w-5 h-5" />
              </div>
              <LoadingSkeleton className="h-8 w-16 mb-1" />
              <LoadingSkeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Recent leads skeleton */}
        <div className="bg-white rounded-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <LoadingSkeleton className="h-6 w-32" />
            <LoadingSkeleton className="h-4 w-20" />
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <LoadingSkeleton className="h-5 w-24" />
                    <LoadingSkeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <LoadingSkeleton className="h-4 w-20" />
                </div>
                <LoadingSkeleton className="h-4 w-32 mb-2" />
                <LoadingSkeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statCards = stats ? [
    {
      name: 'Товаров',
      value: stats.productsCount,
      subValue: `${stats.activeProductsCount} активных`,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Заявок',
      value: stats.leadsCount,
      subValue: `${stats.newLeadsCount} новых`,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      name: 'Отзывов',
      value: stats.reviewsCount,
      subValue: `${stats.pendingReviewsCount} на модерации`,
      icon: Users,
      color: 'bg-purple-500',
    },
  ] : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-1 text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.subValue}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent leads */}
      <div className="bg-white rounded-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Последние заявки</h2>
          <Link href="/admin/leads" className="text-sm text-blue-600 hover:underline">
            Все заявки →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Заявок пока нет
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(lead.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {lead.phone}
                </div>
                <div className="text-sm text-gray-600">
                  {lead.items.map(item => item.product?.name).filter(Boolean).join(', ') || 'Товары не указаны'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
