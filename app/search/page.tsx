'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Grid, List, Package } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductCard } from '@/components/ProductCard'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice: number | null
  images: Array<{ url: string }>
  brand?: { name: string }
  variants: Array<{ color?: string; memory?: string; stock: number }>
  isNew: boolean
  isHit: boolean
  isFeatured: boolean
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams?.get('q') || ''
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    brand: '',
    category: '',
  })

  useEffect(() => {
    if (query) {
      searchProducts()
    } else {
      setLoading(false)
    }
  }, [query, sortBy, filters])

  const searchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        sort: sortBy,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })

      const res = await fetch(`/api/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortOptions = [
    { value: 'relevance', label: 'По релевантности' },
    { value: 'price_asc', label: 'Цена: по возрастанию' },
    { value: 'price_desc', label: 'Цена: по убыванию' },
    { value: 'name_asc', label: 'Название: А-Я' },
    { value: 'name_desc', label: 'Название: Я-А' },
    { value: 'newest', label: 'Сначала новые' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container-custom">
          {/* Search header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 dark-text">
              {query ? `Результаты поиска: "${query}"` : 'Поиск товаров'}
            </h1>
            {query && (
              <p className="dark-text-muted">
                {loading ? 'Поиск...' : `Найдено ${products.length} товаров`}
              </p>
            )}
          </div>

          {!query ? (
            /* Empty state */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 dark-text">Введите запрос для поиска</h2>
              <p className="text-gray-600 mb-6">
                Найдите нужный товар среди тысяч позиций
              </p>
              <Link href="/catalog" className="btn-primary">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters sidebar */}
              <div className="lg:col-span-1">
                <div className="dark-card rounded-2xl p-6 sticky top-24">
                  <h3 className="font-semibold mb-4 dark-text flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Фильтры
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Price range */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark-text">Цена, ₽</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="От"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                          className="px-3 py-2 border dark-border rounded-lg text-sm bg-white dark-text"
                        />
                        <input
                          type="number"
                          placeholder="До"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                          className="px-3 py-2 border dark-border rounded-lg text-sm bg-white dark-text"
                        />
                      </div>
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="block text-sm font-medium mb-2 dark-text">Бренд</label>
                      <select
                        value={filters.brand}
                        onChange={(e) => setFilters({...filters, brand: e.target.value})}
                        className="w-full px-3 py-2 border dark-border rounded-lg text-sm bg-white dark-text"
                      >
                        <option value="">Все бренды</option>
                        <option value="apple">Apple</option>
                        <option value="samsung">Samsung</option>
                        <option value="sony">Sony</option>
                        <option value="google">Google</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setFilters({ minPrice: '', maxPrice: '', brand: '', category: '' })}
                      className="w-full btn-secondary btn-sm"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border dark-border rounded-lg text-sm bg-white dark-text"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Products */}
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 dark-text">Ничего не найдено</h2>
                    <p className="text-gray-600 mb-6">
                      Попробуйте изменить поисковый запрос или фильтры
                    </p>
                    <Link href="/catalog" className="btn-primary">
                      Перейти в каталог
                    </Link>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' 
                    : 'space-y-4'
                  }>
                    {products.map((product) => (
                      viewMode === 'grid' ? (
                        <ProductCard key={product.id} product={product} />
                      ) : (
                        <div key={product.id} className="dark-card rounded-2xl p-4 flex gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images[0]?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-contain p-1"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                {product.brand && (
                                  <p className="text-sm text-gray-500">{product.brand.name}</p>
                                )}
                                <Link href={`/product/${product.slug}`}>
                                  <h3 className="font-medium dark-text hover:text-primary-600 transition-colors line-clamp-2">
                                    {product.name}
                                  </h3>
                                </Link>
                                {product.variants.length > 0 && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {product.variants.map(v => v.color || v.memory).filter(Boolean).slice(0, 2).join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold dark-text">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.oldPrice && (
                                    <span className="text-sm text-gray-400 line-through">
                                      {formatPrice(product.oldPrice)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1 mt-2">
                                  {product.isNew && <span className="badge badge-new">Новинка</span>}
                                  {product.isHit && <span className="badge badge-hit">Хит</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}