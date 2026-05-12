'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCcw, CheckCircle, ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { cn, normalizePhone } from '@/lib/utils'
import toast from 'react-hot-toast'

const brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Google', 'OnePlus', 'Другой']
const conditions = [
  { value: 'excellent', label: 'Отличное — как новое' },
  { value: 'good', label: 'Хорошее — мелкие царапины' },
  { value: 'fair', label: 'Удовлетворительное — заметные повреждения' },
  { value: 'poor', label: 'Плохое — не работает' },
]
const memories = ['64GB', '128GB', '256GB', '512GB', '1TB']
const kits = [
  { value: 'full', label: 'Полный комплект (коробка, зарядка, наушники)' },
  { value: 'box-charger', label: 'Коробка и зарядка' },
  { value: 'box-only', label: 'Только коробка' },
  { value: 'device-only', label: 'Только устройство' },
]

export default function TradeInPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    condition: '',
    memory: '',
    kit: '',
    name: '',
    phone: '',
    comment: '',
    agreement: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {}
    
    if (stepNumber === 1) {
      if (!formData.brand) newErrors.brand = 'Выберите бренд'
      if (!formData.model) newErrors.model = 'Укажите модель'
      if (!formData.condition) newErrors.condition = 'Выберите состояние'
    }
    
    if (stepNumber === 2) {
      if (!formData.name || formData.name.length < 2) newErrors.name = 'Введите имя'
      if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Введите телефон'
      if (!formData.agreement) newErrors.agreement = 'Необходимо согласие'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return
    
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: normalizePhone(formData.phone),
        }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Заявка отправлена!')
        setStep(3)
      } else {
        toast.error(data.error || 'Ошибка при отправке')
      }
    } catch (error) {
      toast.error('Ошибка при отправке')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-custom py-8 md:py-12">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <RefreshCcw className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Trade-in</h1>
            <p className="text-gray-600">
              Обменяйте старый смартфон на новый и получите скидку до 50 000 ₽
            </p>
          </div>

          {/* Progress */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
                    step >= s ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                  )}>
                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={cn(
                      "w-full h-1 mx-2 rounded transition-colors",
                      step > s ? "bg-gray-900" : "bg-gray-200"
                    )} style={{ width: '60px' }} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Устройство</span>
              <span>Контакты</span>
              <span>Готово</span>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Бренд устройства</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {brands.map(brand => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setFormData({ ...formData, brand })}
                          className={cn(
                            "px-4 py-3 rounded-xl border text-sm transition-colors",
                            formData.brand === brand
                              ? "bg-gray-900 text-white border-gray-900"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                    {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Модель</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="input-field"
                      placeholder="Например: iPhone 14 Pro Max"
                    />
                    {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Состояние</label>
                    <div className="space-y-2">
                      {conditions.map(cond => (
                        <label
                          key={cond.value}
                          className={cn(
                            "flex items-center p-3 rounded-xl border cursor-pointer transition-colors",
                            formData.condition === cond.value
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <input
                            type="radio"
                            name="condition"
                            value={cond.value}
                            checked={formData.condition === cond.value}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            className="mr-3"
                          />
                          <span>{cond.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Объем памяти</label>
                    <div className="flex flex-wrap gap-2">
                      {memories.map(mem => (
                        <button
                          key={mem}
                          type="button"
                          onClick={() => setFormData({ ...formData, memory: mem })}
                          className={cn(
                            "px-4 py-2 rounded-xl border text-sm transition-colors",
                            formData.memory === mem
                              ? "bg-gray-900 text-white border-gray-900"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {mem}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Комплектация</label>
                    <div className="space-y-2">
                      {kits.map(kit => (
                        <label
                          key={kit.value}
                          className={cn(
                            "flex items-center p-3 rounded-xl border cursor-pointer transition-colors",
                            formData.kit === kit.value
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <input
                            type="radio"
                            name="kit"
                            value={kit.value}
                            checked={formData.kit === kit.value}
                            onChange={(e) => setFormData({ ...formData, kit: e.target.value })}
                            className="mr-3"
                          />
                          <span className="text-sm">{kit.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => validateStep(1) && setStep(2)}
                    className="btn-primary w-full"
                  >
                    Далее
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ваше имя</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={cn("input-field", errors.name && "border-red-500")}
                      placeholder="Иван"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Телефон</label>
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
                    <label className="block text-sm font-medium mb-2">Комментарий (необязательно)</label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="input-field resize-none h-24"
                      placeholder="Дополнительная информация"
                    />
                  </div>

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

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn-primary flex-1"
                    >
                      {submitting ? 'Отправка...' : 'Отправить заявку'}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Заявка отправлена!</h2>
                  <p className="text-gray-600 mb-6">
                    Мы свяжемся с вами в ближайшее время для уточнения стоимости вашего устройства.
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="btn-primary"
                  >
                    На главную
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="max-w-2xl mx-auto mt-12">
            <h2 className="text-xl font-semibold mb-4">Как работает Trade-in?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-3 text-primary-600 font-semibold">1</div>
                <h3 className="font-medium mb-1">Оставьте заявку</h3>
                <p className="text-sm text-gray-600">Расскажите о вашем устройстве</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-3 text-primary-600 font-semibold">2</div>
                <h3 className="font-medium mb-1">Получите оценку</h3>
                <p className="text-sm text-gray-600">Менеджер назовет стоимость обмена</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-3 text-primary-600 font-semibold">3</div>
                <h3 className="font-medium mb-1">Получите скидку</h3>
                <p className="text-sm text-gray-600">Обменяйте устройство на новое</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
