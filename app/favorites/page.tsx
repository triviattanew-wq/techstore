'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ShoppingCart, X, Package } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FavoriteItem {
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
    variants: Array<{ color?: string; memory?: string }>
  }
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addItem } = useCart()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login?callbackUrl=/favorites')
      return
    }

    fetchFavorites()
  }, [session, status, router])

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data)
      } else {
        toast.error('Ошибка при загрузке избранного')
      }
    } catch (error) {
      toast.error('Ошибка при загрузке избранного')
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (productId: string) => {
    try {
      const res = await fetch(`/api/favorites/${productId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setFavorites(favorites.filter(item => item.productId !== productId))
        toast.success('Товар удален из избранного')
      } else {
        toast.error('Ошибка при удалении из избранного')
      }
    } catch (error) {
      toast.error('Ошибка при удалении из избранного')
    }
  }

  const handleAddToCart = async (product: FavoriteItem['product']) => {
    try {
      await addItem(product.id, 1)
      toast.success('Товар добавлен в корзину')
    } catch (error) {
      toast.error('Ошибка при добавлении в корзину')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-12">
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
            <h1 className="text-3xl font-bold mb-2 dark-text">Избранное</h1>
            <p className="dark-text-muted">
              {favorites.length > 0 
                ? `${favorites.length} ${favorites.length === 1 ? 'товар' : favorites.length < 5 ? 'товара' : 'товаров'}`
                : 'Пока нет избранных товаров'
              }
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 dark-text">Избранное пусто</h2>
              <p className="text-gray-600 mb-6">
                Добавляйте товары в избранное, чтобы не потерять их
              </p>
              <Link href="/catalog" className="btn-primary">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((item) => (
                <div key={item.id} className="dark-card rounded-2xl p-4 group">
                  <div className="relative mb-4">
                    <Link href={`/product/${item.product.slug}`}>
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        {item.product.images[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-2"
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
                      onClick={() => removeFromFavorites(item.productId)}
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

                    {item.product.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.product.variants.slice(0, 3).map((variant, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {variant.color || variant.memory}
                          </span>
                        ))}
                      </div>
                    )}

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
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}