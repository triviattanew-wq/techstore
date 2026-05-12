'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, X, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice, cn, normalizePhone } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const { items, totalItems, totalPrice, isLoading, removeItem, updateQuantity, refreshCart } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: '',
    agreement: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const discount = appliedPromo?.discount || 0
  const finalTotal = totalPrice - discount

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    
    setPromoLoading(true)
    try {
      const res = await fetch(`/api/promo/check?code=${encodeURIComponent(promoCode)}`)
      const data = await res.json()
      
      if (data.valid) {
        const discountAmount = data.isPercent 
          ? totalPrice * (data.discount / 100)
          : data.discount
        setAppliedPromo({ code: promoCode, discount: discountAmount })
        toast.success('Промокод применён')
      } else {
        toast.error(data.message || 'Недействительный промокод')
      }
    } catch (error) {
      toast.error('Ошибка при проверке промокода')
    } finally {
      setPromoLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Введите имя (минимум 2 символа)'
    }
    
    const phoneCleaned = formData.phone.replace(/\D/g, '')
    if (!phoneCleaned || phoneCleaned.length < 10) {
      newErrors.phone = 'Введите корректный номер телефона'
    }
    
    if (!formData.agreement) {
      newErrors.agreement = 'Необходимо согласие на обработку данных'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (items.length === 0) {
      toast.error('Корзина пуста')
      return
    }
    
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: normalizePhone(formData.phone),
          email: formData.email,
          comment: formData.comment,
          promoCode: appliedPromo?.code,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId,
            price: item.product.price,
          })),
          source: 'cart',
        }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
        await refreshCart()
        router.push('/cart/success')
      } else {
        toast.error(data.error || 'Ошибка при отправке заявки')
      }
    } catch (error) {
      toast.error('Ошибка при отправке заявки')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-custom py-6 md:py-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-900">Главная</Link>
            <span>/</span>
            <span className="text-gray-900">Корзина</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            Корзина
            {totalItems > 0 && (
              <span className="text-gray-400 font-normal ml-2">({totalItems} товаров)</span>
            )}
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Корзина пуста</h2>
              <p className="text-gray-500 mb-6">
                Добавьте товары в корзину, чтобы оформить заявку
              </p>
              <Link href="/catalog" className="btn-primary">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 md:p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
                        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-xl overflow-hidden">
                          {item.product.images[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-contain p-1"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              Нет фото
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4">
                          <Link 
                            href={`/product/${item.product.slug}`}
                            className="font-medium hover:text-primary-600 line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatPrice(Number(item.product.price) * item.quantity)}
                            </div>
                            {item.product.oldPrice && (
                              <div className="text-sm text-gray-400 line-through">
                                {formatPrice(Number(item.product.oldPrice) * item.quantity)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Form */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 sticky top-24">
                  <h2 className="text-lg font-semibold mb-4">Оформление заявки</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Имя <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={cn("input-field", errors.name && "border-red-500")}
                        placeholder="Ваше имя"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Телефон <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={cn("input-field", errors.phone && "border-red-500")}
                        placeholder="+7 (___) ___-__-__"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Комментарий</label>
                      <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        className="input-field resize-none h-20"
                        placeholder="Комментарий к заказу"
                      />
                    </div>

                    {/* Promo Code */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Промокод</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="input-field flex-1"
                          placeholder="Промокод"
                          disabled={!!appliedPromo}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode || !!appliedPromo}
                          className="px-4 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                        >
                          {promoLoading ? '...' : 'OK'}
                        </button>
                      </div>
                      {appliedPromo && (
                        <div className="flex items-center justify-between mt-2 text-sm text-green-600">
                          <span>Промокод {appliedPromo.code} применён</span>
                          <button
                            type="button"
                            onClick={() => setAppliedPromo(null)}
                            className="text-red-500"
                          >
                            Отменить
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Товары ({items.length})</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Скидка</span>
                          <span>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
                        <span>Итого</span>
                        <span>{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    {/* Agreement */}
                    <label className={cn(
                      "flex items-start gap-2 text-sm",
                      errors.agreement && "text-red-500"
                    )}>
                      <input
                        type="checkbox"
                        checked={formData.agreement}
                        onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                        className="mt-1"
                      />
                      <span className="text-gray-600">
                        Согласен с{' '}
                        <a href="/privacy" className="text-primary-600 hover:underline" target="_blank">
                          политикой обработки персональных данных
                        </a>
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full py-4"
                    >
                      {submitting ? 'Отправка...' : 'Оставить заявку'}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Безопасная передача данных</span>
                    </div>
                  </form>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    После отправки заявки менеджер свяжется с вами для подтверждения заказа
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
