'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Clock, Phone, Mail, ExternalLink, Search } from 'lucide-react'
import { SafeButton } from '@/components/admin/SafeButton'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  comment?: string
  status: string
  totalAmount?: number
  managerNote?: string
  createdAt: string
  items: Array<{
    quantity: number
    product?: {
      id: string
      name: string
      slug: string
    }
  }>
}

interface LeadsData {
  leads: Lead[]
  total: number
  pages: number
  page: number
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

export default function AdminLeadsPage() {
  const [leadsData, setLeadsData] = useState<LeadsData>({
    leads: [],
    total: 0,
    pages: 0,
    page: 1
  })
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  // Загрузка заявок
  const loadLeads = useCallback(async (status = 'all', page = 1) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      params.set('page', page.toString())

      const response = await fetch(`/api/admin/leads?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setLeadsData(data || { leads: [], total: 0, pages: 0, page: 1 })
      } else {
        console.error('Failed to load leads:', response.status)
        setLeadsData({ leads: [], total: 0, pages: 0, page: 1 })
        toast.error('Ошибка загрузки заявок')
      }
    } catch (error) {
      console.error('Load leads error:', error)
      setLeadsData({ leads: [], total: 0, pages: 0, page: 1 })
      toast.error('Ошибка загрузки заявок')
    } finally {
      setLoading(false)
    }
  }, [])

  // Загрузка при монтировании
  useEffect(() => {
    loadLeads(currentStatus, currentPage)
  }, [loadLeads, currentStatus, currentPage])

  // Обновление статуса заявки
  const updateLeadStatus = useCallback(async (leadId: string, newStatus: string) => {
    setUpdatingStatus(leadId)
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Обновляем локальное состояние
        setLeadsData(prev => ({
          ...prev,
          leads: prev.leads.map(lead => 
            lead.id === leadId ? { ...lead, status: newStatus } : lead
          )
        }))
        toast.success('Статус заявки обновлен')
      } else {
        toast.error('Ошибка при обновлении статуса')
      }
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Ошибка при обновлении статуса')
    } finally {
      setUpdatingStatus(null)
    }
  }, [])

  // Обработка смены фильтра
  const handleStatusFilter = useCallback((status: string) => {
    setCurrentStatus(status)
    setCurrentPage(1)
  }, [])

  // Обработка смены страницы
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-xl p-4">
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Заявки</h1>
        <span className="text-gray-500">Всего: {leadsData.total}</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex gap-2 flex-wrap">
          <SafeButton
            onClick={() => handleStatusFilter('all')}
            variant={currentStatus === 'all' ? 'primary' : 'secondary'}
            size="sm"
          >
            Все
          </SafeButton>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SafeButton
              key={value}
              onClick={() => handleStatusFilter(value)}
              variant={currentStatus === value ? 'primary' : 'secondary'}
              size="sm"
            >
              {label}
            </SafeButton>
          ))}
        </div>
      </div>

      {/* Leads list */}
      <div className="bg-white rounded-xl overflow-hidden">
        {leadsData.leads.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">Заявки не найдены</h3>
            <p className="text-sm">
              {currentStatus !== 'all' ? 'Попробуйте изменить фильтр' : 'Заявок пока нет'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leadsData.leads.map((lead) => (
              <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-lg text-gray-900">{lead.name}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                        {statusLabels[lead.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </span>
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(lead.createdAt).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-lg text-gray-900">
                    {lead.totalAmount ? Number(lead.totalAmount).toLocaleString('ru-RU') + ' ₽' : '-'}
                  </span>
                </div>

                {/* Products */}
                {lead.items.length > 0 && (
                  <div className="mb-3">
                    {lead.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">{item.quantity}×</span>
                        {item.product ? (
                          <Link
                            href={`/product/${item.product.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {item.product.name}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-gray-500">Товар удален</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {lead.comment && (
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                    {lead.comment}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      disabled={updatingStatus === lead.id}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {updatingStatus === lead.id && (
                      <div className="text-sm text-gray-500">Обновление...</div>
                    )}
                  </div>

                  {lead.managerNote && (
                    <span className="text-sm text-gray-500">Заметка: {lead.managerNote}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {leadsData.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: leadsData.pages }, (_, i) => (
            <SafeButton
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              variant={leadsData.page === i + 1 ? 'primary' : 'secondary'}
              size="sm"
            >
              {i + 1}
            </SafeButton>
          ))}
        </div>
      )}
    </div>
  )
}
