'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OptimizedImage } from '@/components/OptimizedImage'
import clsx from 'clsx'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: { url: string }[]
}

interface SubCategory {
  id: string
  name: string
  slug: string
  products: Product[]
}

interface Category {
  id: string
  name: string
  slug: string
  children?: SubCategory[]
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        setCategories(data.categories || [])
        if (data.categories && data.categories.length > 0) {
          setSelectedCategory(data.categories[0])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-dark-500">Загрузка...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-100 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="border-b border-gray-100 dark:border-dark-200">
          <div className="container-custom py-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-500">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-dark-900 transition-colors">Главная</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-dark-900">Каталог</span>
            </div>
          </div>
        </div>

        <div className="container-custom py-8 md:py-12">
          {/* Title */}
          <div className="mb-8">
            <h1 className="section-title mb-2">Каталог товаров</h1>
            <p className="text-gray-600 dark:text-dark-600">
              Выберите категорию и откройте для себя лучшие предложения
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-dark-200 rounded-2xl overflow-hidden sticky top-24 border border-gray-100 dark:border-dark-300">
                <div className="p-4 md:p-5 border-b border-gray-100 dark:border-dark-300">
                  <h2 className="font-semibold text-gray-900 dark:text-dark-900">Категории</h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-dark-300">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={clsx(
                        'w-full text-left px-4 md:px-5 py-3 md:py-4 transition-all duration-200 flex items-center justify-between group',
                        selectedCategory?.id === cat.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                          : 'text-gray-700 dark:text-dark-700 hover:bg-gray-100 dark:hover:bg-dark-300'
                      )}
                    >
                      <span className="text-sm md:text-base">{cat.name}</span>
                      <ChevronRight 
                        size={18} 
                        className={clsx(
                          'transition-transform duration-200',
                          selectedCategory?.id === cat.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-dark-600'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4">
              {selectedCategory ? (
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-900 mb-2">
                      {selectedCategory.name}
                    </h2>
                    <p className="text-gray-600 dark:text-dark-600">
                      {selectedCategory.children?.length || 0} подкатегорий
                    </p>
                  </div>

                  {/* Subcategories Grid */}
                  {selectedCategory.children && selectedCategory.children.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {selectedCategory.children.map(subCat => (
                        <Link
                          key={subCat.id}
                          href={`/catalog/${selectedCategory.slug}/${subCat.slug}`}
                          className="group"
                        >
                          <div className="bg-white dark:bg-dark-100 rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                            {/* Subcategory Header */}
                            <div className="p-4 md:p-5 border-b border-gray-100 dark:border-dark-300 bg-gray-50 dark:bg-dark-200 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors duration-300">
                              <h3 className="font-semibold text-gray-900 dark:text-dark-900 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm md:text-base">
                                {subCat.name}
                              </h3>
                              <p className="text-xs md:text-sm text-gray-500 dark:text-dark-500 mt-1">
                                {subCat.products?.length || 0} товаров
                              </p>
                            </div>

                            {/* Products Grid on Hover */}
                            <div className="p-4 md:p-5 flex-1 relative overflow-hidden min-h-[200px] md:min-h-[240px] flex items-center justify-center">
                              {/* Default view - first product */}
                              {subCat.products && subCat.products.length > 0 && (
                                <div className="absolute inset-0 p-4 md:p-5 flex flex-col items-center justify-center bg-white dark:bg-dark-100 group-hover:opacity-0 transition-opacity duration-300">
                                  <div className="text-center w-full">
                                    {subCat.products[0].images && subCat.products[0].images[0] && (
                                      <div className="relative w-full h-24 md:h-28 mb-3">
                                        <OptimizedImage
                                          src={subCat.products[0].images[0].url}
                                          alt={subCat.products[0].name}
                                          fill
                                          className="object-contain"
                                          sizes="(max-width: 640px) 100px, 120px"
                                        />
                                      </div>
                                    )}
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-dark-600 font-medium line-clamp-2">
                                      {subCat.products[0].name}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Hover view - all products grid */}
                              <div className="absolute inset-0 p-4 md:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                  {subCat.products && subCat.products.slice(0, 6).map(product => (
                                    <div
                                      key={product.id}
                                      className="flex flex-col items-center justify-center p-2 md:p-3 bg-gray-50 dark:bg-dark-200 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                                    >
                                      {product.images && product.images[0] && (
                                        <div className="relative w-12 h-12 md:w-14 md:h-14 mb-1">
                                          <OptimizedImage
                                            src={product.images[0].url}
                                            alt={product.name}
                                            fill
                                            className="object-contain"
                                            sizes="60px"
                                          />
                                        </div>
                                      )}
                                      <p className="text-xs text-gray-600 dark:text-dark-600 text-center line-clamp-2">
                                        {product.name}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                {subCat.products && subCat.products.length > 6 && (
                                  <p className="text-xs text-gray-500 dark:text-dark-500 text-center mt-2">
                                    +{subCat.products.length - 6} ещё
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 md:p-5 border-t border-gray-100 dark:border-dark-300 bg-gray-50 dark:bg-dark-200 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors duration-300">
                              <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-dark-900 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                  Смотреть все
                                </span>
                                <ChevronRight 
                                  size={16} 
                                  className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-dark-200 rounded-2xl p-12 text-center border border-gray-100 dark:border-dark-300">
                      <p className="text-gray-500 dark:text-dark-500">Подкатегории не найдены</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-dark-200 rounded-2xl p-12 text-center border border-gray-100 dark:border-dark-300">
                  <p className="text-gray-500 dark:text-dark-500">Выберите категорию</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Back to Home Button */}
      <div className="border-t border-gray-100 dark:border-dark-200 py-6 md:py-8">
        <div className="container-custom">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-full transition-colors font-medium text-sm md:text-base"
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
