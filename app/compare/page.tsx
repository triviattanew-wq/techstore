'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scale, ShoppingCart, X, Package, ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CompareItem {
  id: string
  productId: string
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    oldPrice?: number
    images: Array<{ url: string }>
    brand?: { name: string }
    variants: Array<{ color?: string; memory?: string; price?: number }>
    characteristics: Array<{
      name: string
      value: string
      group: string
    }>
  }
}

export default function ComparePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addItem } = useCart()
  const [compareItems, setCompareItems] = useState<CompareItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login?callbackUrl=/compare')
      return
    }

    fetchCompareItems()
  }, [session, status, router])

  const fetchCompareItems = async () => {
    try {
      const res = await fetch('/api/compare')
      if (res.ok) {
        const data = await res.json()
        setCompareItems(data)
      } else {
        toast.error('Ошибка при загрузке сравнения')
      }
    } catch (error) {
      toast.error('Ошибка при загрузке сравнения')
    } finally {
      setLoading(false)
    }
  }

  const removeFromCompare = async (productId: string) => {
    try {
      const res = await fetch(`/api/compare/${productId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setCompareItems(compareItems.filter(item => item.productId !== productId))
        toast.success('Товар удален из сравнения')
      } else {
        toast.error('Ошибка при удалении из сравнения')
      }
    } catch (error) {
      toast.error('Ошибка при удалении из сравнения')
    }
  }

  const handleAddToCart = async (product: CompareItem['product']) => {
    try {
      await addItem(product.id, 1)
      toast.success('Товар добавлен в корзину')
    } catch (error) {
      toast.error('Ошибка при добавлении в корзину')
    }
  }

  // Группируем характеристики
  const groupedCharacteristics = compareItems.length > 0 
    ? compareItems[0].product.characteristics.reduce((groups, char) => {
        if (!groups[char.group]) {
          groups[char.group] = []
        }
        groups[char.group].push(char.name)
        return groups
      }, {} as Record<string, string[]>)
    : {}

  // Фильтруем характеристики для показа только различий
  const getFilteredCharacteristics = () => {
    if (!showDifferencesOnly) return groupedCharacteristics

    const filtered: Record<string, string[]> = {}
    
    Object.entries(groupedCharacteristics).forEach(([group, charNames]) => {
      const differentChars = charNames.filter(charName => {
        const values = compareItems.map(item => 
          item.product.characteristics.find(c => c.name === charName)?.value || '-'
        )
        return new Set(values).size > 1
      })
      
      if (differentChars.length > 0) {
        filtered[group] = differentChars
      }
    })
    
    return filtered
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-8">
          <div className="container-custom">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 dark-text">Сравнение товаров</h1>
            <p className="dark-text-muted">
              {compareItems.length > 0 
                ? `${compareItems.length} из 4 товаров`
                : 'Нет товаров для сравнения'
              }
            </p>
          </div>

          {compareItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 dark-text">Нет товаров для сравнения</h2>
              <p className="text-gray-600 mb-6">
                Добавьте товары в сравнение, чтобы выбрать лучший вариант
              </p>
              <Link href="/catalog" className="btn-primary">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Фильтр */}
              {compareItems.length > 1 && (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showDifferencesOnly}
                      onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm dark-text">Показать только различия</span>
                  </label>
                </div>
              )}

              {/* Карточки товаров */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {compareItems.map((item) => (
                  <div key={item.id} className="dark-card rounded-2xl p-4">
                    <div className="relative mb-4">
                      <Link href={`/product/${item.product.slug}`}>
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                          {item.product.images[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-contain p-1"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => removeFromCompare(item.productId)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        {item.product.brand && (
                          <p className="text-sm text-gray-500">{item.product.brand.name}</p>
                        )}
                        <Link href={`/product/${item.product.slug}`}>
                          <h3 className="font-medium dark-text hover:text-primary-600 transition-colors line-clamp-2">
                            {item.product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold dark-text">
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(item.product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className="w-full btn-primary btn-sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        В корзину
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Таблица сравнения характеристик */}
              {compareItems.length > 1 && (
                <div className="dark-card rounded-2xl overflow-hidden">
                  <div className="p-6 border-b dark-border">
                    <h2 className="text-xl font-semibold dark-text">Характеристики</h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="dark-bg">
                          <th className="text-left p-4 font-medium dark-text">Характеристика</th>
                          {compareItems.map((item) => (
                            <th key={item.id} className="text-left p-4 font-medium dark-text min-w-[200px]">
                              {item.product.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(getFilteredCharacteristics()).map(([group, charNames]) => (
                          <>
                            <tr key={group} className="dark-bg">
                              <td colSpan={compareItems.length + 1} className="p-4 font-semibold dark-text">
                                {group}
                              </td>
                            </tr>
                            {charNames.map((charName) => (
                              <tr key={charName} className="border-t dark-border">
                                <td className="p-4 dark-text-muted">{charName}</td>
                                {compareItems.map((item) => {
                                  const char = item.product.characteristics.find(c => c.name === charName)
                                  return (
                                    <td key={item.id} className="p-4 dark-text">
                                      {char?.value || '-'}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}