'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Clock, CheckCircle, XCircle, User, Heart, Scale, Settings, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    name: string
    slug: string
    images: Array<{ url: string }>
  }
}

interface Order {
  id: string
  name: string
  phone: string
  email?: string
  status: string
  totalAmount?: number
  comment?: string
  createdAt: string
  items: OrderItem[]
}

const statusLabels: Record<string, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  CONFIRMED: 'Подтверждена',
  CANCELLED: 'Отменена',
  COMPLETED: 'Завершена',
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
}

const statusIcons: Record<string, any> = {
  NEW: Clock,
  IN_PROGRESS: Clock,
  CONFIRMED: CheckCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login?callbackUrl=/profile/orders')
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      } else {
        toast.error('Ошибка при загрузке заказов')
      }
    } catch (error) {
      toast.error('Ошибка при загрузке заказов')
    } finally {
      setLoading(false)
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад в профиль
              </Link>
              <h1 className="text-3xl font-bold mb-2 dark-text">Мои заявки</h1>
              <p className="dark-text-muted">
                {orders.length > 0 
                  ? `${orders.length} ${orders.length === 1 ? 'заявка' : orders.length < 5 ? 'заявки' : 'заявок'}`
                  : 'Пока нет заявок'
                }
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="dark-card rounded-2xl p-6">
                  <nav className="space-y-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Профиль
                    </Link>
                    <Link
                      href="/profile/orders"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 text-gray-900"
                    >
                      <Package className="w-5 h-5" />
                      Мои заявки
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      Избранное
                    </Link>
                    <Link
                      href="/compare"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Scale className="w-5 h-5" />
                      Сравнение
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      Настройки
                    </Link>
                  </nav>
                </div>
              </div>

              {/* Orders */}
              <div className="lg:col-span-3">
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 dark-text">Пока нет заявок</h2>
                    <p className="text-gray-600 mb-6">
                      Оформите первый заказ в нашем каталоге
                    </p>
                    <Link href="/catalog" className="btn-primary">
                      Перейти в каталог
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const StatusIcon = statusIcons[order.status]
                      return (
                        <div key={order.id} className="dark-card rounded-2xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold dark-text">Заявка #{order.id.slice(-8)}</h3>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusLabels[order.status]}
                                </span>
                              </div>
                              <p className="text-sm dark-text-muted">
                                {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {order.totalAmount && (
                              <div className="text-right">
                                <p className="text-lg font-bold dark-text">
                                  {formatPrice(order.totalAmount)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Order items */}
                          <div className="space-y-3 mb-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                                      <Package className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/product/${item.product.slug}`}
                                    className="font-medium dark-text hover:text-primary-600 transition-colors line-clamp-1"
                                  >
                                    {item.product.name}
                                  </Link>
                                  <p className="text-sm dark-text-muted">
                                    Количество: {item.quantity} шт.
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium dark-text">
                                    {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order details */}
                          <div className="border-t dark-border pt-4">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="dark-text-muted">Контактное лицо:</p>
                                <p className="dark-text">{order.name}</p>
                              </div>
                              <div>
                                <p className="dark-text-muted">Телефон:</p>
                                <p className="dark-text">{order.phone}</p>
                              </div>
                              {order.email && (
                                <div>
                                  <p className="dark-text-muted">Email:</p>
                                  <p className="dark-text">{order.email}</p>
                                </div>
                              )}
                              {order.comment && (
                                <div className="md:col-span-2">
                                  <p className="dark-text-muted">Комментарий:</p>
                                  <p className="dark-text">{order.comment}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}