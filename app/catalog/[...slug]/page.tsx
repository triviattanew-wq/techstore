'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SlidersHorizontal, Grid3X3, List, ChevronDown, X, Star, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductCard } from '@/components/ProductCard'
import { cn, formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice: number | null
  images: { url: string }[]
  brand?: { name: string }
  variants?: { color?: string; memory?: string; stock: number }[]
  isNew?: boolean
  isHit?: boolean
  characteristics?: { name: string; value: string }[]
}

interface Category {
  id: string
  name: string
  slug: string
  children?: Category[]
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface Filters {
  brands: string[]
  minPrice: number
  maxPrice: number
  memory: string[]
  color: string[]
  inStock: boolean
  isNew: boolean
  isHit: boolean
}

const sortOptions = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'newest', label: 'По новизне' },
  { value: 'name', label: 'По названию' },
]

function CatalogContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const slug = params.slug as string[]
  const slugMap: Record<string, string> = {
    'smartphones': 'iphone',
    'apple': 'iphone',
    'tablets': 'ipad',
    'laptops': 'macbook',
    'audio': 'airpods',
    'smart-home': 'apple-watch',
    'iphone': 'iphone',
    'ipad': 'ipad',
    'macbook': 'macbook',
    'airpods': 'airpods',
    'apple-watch': 'apple-watch',
    'accessories': 'accessories',
  }
  const rawSlug = slug?.[slug.length - 1] || slug?.[0] || ''
  const categorySlug = slugMap[rawSlug] || rawSlug

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [filters, setFilters] = useState<Filters>({
    brands: [],
    minPrice: 0,
    maxPrice: 1000000,
    memory: [],
    color: [],
    inStock: false,
    isNew: false,
    isHit: false,
  })

  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sort, setSort] = useState(searchParams?.get('sort') || 'popular')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const memoryOptions = useMemo(() => {
    const memories = new Set<string>()
    products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.memory) memories.add(v.memory)
      })
    })
    return Array.from(memories).sort((a, b) => {
      const aNum = parseInt(a)
      const bNum = parseInt(b)
      return aNum - bNum
    })
  }, [products])

  const colorOptions = useMemo(() => {
    const colors = new Set<string>()
    products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.color) colors.add(v.color)
      })
    })
    return Array.from(colors)
  }, [products])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (categorySlug) params.set('category', categorySlug)
        if (filters.brands.length) params.set('brands', filters.brands.join(','))
        if (filters.minPrice > 0) params.set('minPrice', String(filters.minPrice))
        if (filters.maxPrice < 1000000) params.set('maxPrice', String(filters.maxPrice))
        if (filters.memory.length) params.set('memory', filters.memory.join(','))
        if (filters.color.length) params.set('color', filters.color.join(','))
        if (filters.inStock) params.set('inStock', 'true')
        if (filters.isNew) params.set('isNew', 'true')
        if (filters.isHit) params.set('isHit', 'true')
        params.set('sort', sort)
        params.set('page', String(page))

        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          fetch(`/api/products?${params}`),
          fetch('/api/categories'),
          fetch('/api/brands'),
        ])

        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()
        const brandsData = await brandsRes.json()

        setProducts(productsData.products || [])
        setTotalPages(productsData.pagination?.pages || 1)
        setCategories(categoriesData || [])
        setBrands(brandsData || [])

        if (categorySlug) {
          const cat = findCategory(categoriesData, categorySlug)
          setCategory(cat)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categorySlug, filters, sort, page])

  function findCategory(cats: Category[], slug: string): Category | null {
    for (const cat of cats) {
      if (cat.slug === slug) return cat
      if (cat.children) {
        const found = findCategory(cat.children, slug)
        if (found) return found
      }
    }
    return null
  }

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const toggleArrayFilter = (key: 'brands' | 'memory' | 'color', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      brands: [],
      minPrice: 0,
      maxPrice: 1000000,
      memory: [],
      color: [],
      inStock: false,
      isNew: false,
      isHit: false,
    })
    setPriceRange([0, 1000000])
    setPage(1)
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.brands.length) count += filters.brands.length
    if (filters.memory.length) count += filters.memory.length
    if (filters.color.length) count += filters.color.length
    if (filters.inStock) count++
    if (filters.isNew) count++
    if (filters.isHit) count++
    if (filters.minPrice > 0 || filters.maxPrice < 1000000) count++
    return count
  }, [filters])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-100">
      <Header />

      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="bg-white dark:bg-dark-100 border-b border-gray-100 dark:border-dark-200">
          <div className="container-custom py-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-500">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-dark-900">Главная</Link>
              {category && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 dark:text-dark-900">{category.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="container-custom py-6 md:py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-900">
                {category?.name || 'Каталог товаров'}
              </h1>
              <p className="text-gray-500 dark:text-dark-500 text-sm mt-1">
                {products.length} товаров
              </p>
            </div>

            {/* Sort & View */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-300 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="hidden md:flex items-center gap-1 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-300 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === 'grid' ? "bg-gray-100 dark:bg-dark-300" : "hover:bg-gray-50 dark:hover:bg-dark-300"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === 'list' ? "bg-gray-100 dark:bg-dark-300" : "hover:bg-gray-50 dark:hover:bg-dark-300"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-300 rounded-xl text-sm text-gray-900 dark:text-dark-900"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Фильтры
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-6 md:gap-8">
            {/* Desktop Filters */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white dark:bg-dark-100 rounded-2xl p-5 sticky top-24 border border-gray-200 dark:border-dark-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-dark-900">Фильтры</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Сбросить
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-dark-900 mb-3">Категории</h4>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <Link
                        key={cat.id}
                        href={`/catalog/${cat.slug}`}
                        className={cn(
                          "block text-sm py-1.5 px-3 rounded-lg transition-colors",
                          cat.slug === categorySlug
                            ? "bg-gray-100 dark:bg-dark-200 text-gray-900 dark:text-dark-900 font-medium"
                            : "text-gray-600 dark:text-dark-600 hover:bg-gray-50 dark:hover:bg-dark-200"
                        )}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-dark-900 mb-3">Бренды</h4>
                  <div className="space-y-2">
                    {brands.map(brand => (
                      <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand.slug)}
                          onChange={() => toggleArrayFilter('brands', brand.slug)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-dark-300 text-primary-600 focus:ring-primary-500 dark:bg-dark-200"
                        />
                        <span className="text-sm text-gray-600 dark:text-dark-600">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-dark-900 mb-3">Цена</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      onBlur={() => handleFilterChange('minPrice', priceRange[0])}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-dark-300 rounded-lg text-sm bg-white dark:bg-dark-200 text-gray-900 dark:text-dark-900"
                      placeholder="От"
                    />
                    <span className="text-gray-400 dark:text-dark-400">—</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      onBlur={() => handleFilterChange('maxPrice', priceRange[1])}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-dark-300 rounded-lg text-sm bg-white dark:bg-dark-200 text-gray-900 dark:text-dark-900"
                      placeholder="До"
                    />
                  </div>
                </div>

                {/* Memory */}
                {memoryOptions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-dark-900 mb-3">Память</h4>
                    <div className="flex flex-wrap gap-2">
                      {memoryOptions.map(memory => (
                        <button
                          key={memory}
                          onClick={() => toggleArrayFilter('memory', memory)}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                            filters.memory.includes(memory)
                              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                              : "bg-white dark:bg-dark-200 text-gray-600 dark:text-dark-600 border-gray-200 dark:border-dark-300 hover:border-gray-300 dark:hover:border-dark-200"
                          )}
                        >
                          {memory}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock & Flags */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-dark-300 text-primary-600 focus:ring-primary-500 dark:bg-dark-200"
                    />
                    <span className="text-sm text-gray-600 dark:text-dark-600">В наличии</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isNew}
                      onChange={(e) => handleFilterChange('isNew', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-dark-300 text-primary-600 focus:ring-primary-500 dark:bg-dark-200"
                    />
                    <span className="text-sm text-gray-600 dark:text-dark-600">Новинки</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isHit}
                      onChange={(e) => handleFilterChange('isHit', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-dark-300 text-primary-600 focus:ring-primary-500 dark:bg-dark-200"
                    />
                    <span className="text-sm text-gray-600 dark:text-dark-600">Хиты продаж</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Products */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-dark-100 rounded-2xl p-4 animate-pulse">
                      <div className="aspect-square bg-gray-100 dark:bg-dark-200 rounded-xl mb-4" />
                      <div className="h-4 bg-gray-100 dark:bg-dark-200 rounded mb-2" />
                      <div className="h-4 bg-gray-100 dark:bg-dark-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white dark:bg-dark-100 rounded-2xl p-12 text-center">
                  <p className="text-gray-500 dark:text-dark-500 mb-4">Товары не найдены</p>
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              ) : (
                <>
                  <div className={cn(
                    "grid gap-4",
                    viewMode === 'grid'
                      ? "grid-cols-2 md:grid-cols-3"
                      : "grid-cols-1"
                  )}>
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 border border-gray-200 dark:border-dark-300 rounded-lg text-sm text-gray-900 dark:text-dark-900 bg-white dark:bg-dark-200 disabled:opacity-50"
                        >
                          Назад
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={cn(
                              "w-10 h-10 rounded-lg text-sm",
                              page === i + 1
                                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                                : "bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-300 text-gray-900 dark:text-dark-900 hover:bg-gray-50 dark:hover:bg-dark-300"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 border border-gray-200 dark:border-dark-300 rounded-lg text-sm text-gray-900 dark:text-dark-900 bg-white dark:bg-dark-200 disabled:opacity-50"
                        >
                          Вперёд
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-100 rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-100 border-b border-gray-100 dark:border-dark-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-dark-900">Фильтры</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Brands */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900 dark:text-dark-900">Бренды</h4>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand.slug)}
                        onChange={() => toggleArrayFilter('brands', brand.slug)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-dark-300 text-primary-600 dark:bg-dark-200"
                      />
                      <span className="text-gray-900 dark:text-dark-900">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900 dark:text-dark-900">Цена</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-dark-300 rounded-xl bg-white dark:bg-dark-200 text-gray-900 dark:text-dark-900"
                    placeholder="От"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-dark-300 rounded-xl bg-white dark:bg-dark-200 text-gray-900 dark:text-dark-900"
                    placeholder="До"
                  />
                </div>
              </div>

              {/* Memory */}
              {memoryOptions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-dark-900">Память</h4>
                  <div className="flex flex-wrap gap-2">
                    {memoryOptions.map(memory => (
                      <button
                        key={memory}
                        onClick={() => toggleArrayFilter('memory', memory)}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-sm",
                          filters.memory.includes(memory)
                            ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                            : "bg-white dark:bg-dark-200 text-gray-600 dark:text-dark-600 border-gray-200 dark:border-dark-300"
                        )}
                      >
                        {memory}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-dark-100 border-t border-gray-100 dark:border-dark-200 p-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 border border-gray-200 dark:border-dark-300 rounded-full text-sm font-medium text-gray-900 dark:text-dark-900 hover:bg-gray-50 dark:hover:bg-dark-200"
              >
                Сбросить
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full text-sm font-medium"
              >
                Показать {products.length} товаров
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home Button */}
      <div className="bg-white dark:bg-dark-100 border-t border-gray-100 dark:border-dark-200 py-6">
        <div className="container-custom">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Вернуться на главную
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <CatalogContent />
    </Suspense>
  )
}
