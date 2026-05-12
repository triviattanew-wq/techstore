'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { OptimizedImage } from '@/components/OptimizedImage'
import { SafeButton } from '@/components/admin/SafeButton'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  sku: string | null
  price: number
  oldPrice: number | null
  isActive: boolean
  images: { url: string; alt?: string | null }[]
  brand: { name: string } | null
  category: { name: string } | null
}

interface ProductsData {
  products: Product[]
  total: number
  pages: number
  page: number
}

export default function AdminProductsPage() {
  const [productsData, setProductsData] = useState<ProductsData>({
    products: [],
    total: 0,
    pages: 0,
    page: 1
  })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Безопасная загрузка товаров
  const loadProducts = useCallback(async (search = '', page = 1) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      params.set('page', page.toString())

      const response = await fetch(`/api/admin/products?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setProductsData(data || { products: [], total: 0, pages: 0, page: 1 })
      } else {
        console.error('Failed to load products:', response.status)
        setProductsData({ products: [], total: 0, pages: 0, page: 1 })
        toast.error('Ошибка загрузки товаров')
      }
    } catch (error) {
      console.error('Load products error:', error)
      setProductsData({ products: [], total: 0, pages: 0, page: 1 })
      toast.error('Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }, [])

  // Загрузка при монтировании
  useEffect(() => {
    loadProducts()
  }, [])

  // Безопасное удаление товара
  const handleDelete = useCallback(async (productId: string, productName: string) => {
    if (!productId || !productName) return

    const confirmed = confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)
    if (!confirmed) return

    setDeleting(productId)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProductsData(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
        }))
        toast.success('Товар удален')
      } else {
        toast.error('Ошибка при удалении товара')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ошибка при удалении товара')
    } finally {
      setDeleting(null)
    }
  }, [])

  // Обработка поиска
  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = (formData.get('search') as string) || ''
    setSearchTerm(search)
    loadProducts(search, 1)
  }, [loadProducts])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Товары</h1>
          <div className="w-40 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-xl p-4">
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
        <Link 
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить товар
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchTerm}
              placeholder="Поиск по названию или артикулу..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            type="submit"
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Найти
          </button>
        </form>
      </div>

      {/* Products */}
      <div className="bg-white rounded-xl overflow-hidden">
        {productsData.products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
            <p className="text-sm">
              {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первый товар'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Товар</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Артикул</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Категория</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Цена</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Статус</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsData.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {product.images && product.images[0]?.url ? (
                            <OptimizedImage
                              src={product.images[0].url}
                              alt={product.name || 'Товар'}
                              width={48}
                              height={48}
                              className="object-cover"
                              quality={60}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Нет фото
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name || 'Без названия'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand?.name || 'Без бренда'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.sku || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-gray-900">
                        {product.price?.toLocaleString('ru-RU') || '0'} ₽
                      </div>
                      {product.oldPrice && (
                        <div className="text-sm text-gray-400 line-through">
                          {product.oldPrice.toLocaleString('ru-RU')} ₽
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                          <Eye className="w-4 h-4" />
                          Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                          <EyeOff className="w-4 h-4" />
                          Скрыт
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title="Посмотреть на сайте"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <SafeButton
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          variant="danger"
                          size="sm"
                          className="p-2 !bg-transparent !text-gray-400 hover:!text-red-600 hover:!bg-red-50"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </SafeButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {productsData.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: productsData.pages }, (_, i) => (
            <SafeButton
              key={i + 1}
              onClick={() => loadProducts(searchTerm, i + 1)}
              variant={productsData.page === i + 1 ? 'primary' : 'secondary'}
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