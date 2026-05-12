'use client'

import { useState } from 'react'
import { Search, CheckCircle, Info } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ImeiCheckPage() {
  const [imei, setImei] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [agreement, setAgreement] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    const imeiCleaned = imei.replace(/\D/g, '')
    if (imeiCleaned.length < 14) {
      newErrors.imei = 'IMEI должен содержать минимум 14 цифр'
    }
    
    if (!agreement) {
      newErrors.agreement = 'Необходимо согласие'
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/imei-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imei: imei.replace(/\D/g, ''),
          name: name || undefined,
          phone: phone.replace(/\D/g, '') || undefined,
        }),
      })
      
      if (res.ok) {
        setSubmitted(true)
        toast.success('Заявка отправлена!')
      } else {
        toast.error('Ошибка при отправке')
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
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Проверка IMEI</h1>
              <p className="text-gray-600">
                Узнайте оригинальность устройства Apple, дату покупки, остаток гарантии и другую информацию по IMEI или серийному номеру
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Заявка принята!</h2>
                  <p className="text-gray-600 mb-6">
                    Результат проверки будет отправлен вам по телефону или email в ближайшее время.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setImei('')
                      setName('')
                      setPhone('')
                    }}
                    className="btn-secondary"
                  >
                    Проверить ещё
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      IMEI или серийный номер <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      className={cn("input-field text-lg tracking-wider", errors.imei && "border-red-500")}
                      placeholder="Введите IMEI или серийный номер"
                      maxLength={17}
                    />
                    {errors.imei && <p className="text-red-500 text-sm mt-1">{errors.imei}</p>}
                    <p className="text-sm text-gray-500 mt-2">
                      Наберите *#06# на телефоне, чтобы узнать IMEI
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ваше имя</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="Иван"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Телефон для связи</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field"
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                  </div>

                  <label className={cn(
                    "flex items-start gap-2 text-sm",
                    errors.agreement && "text-red-500"
                  )}>
                    <input
                      type="checkbox"
                      checked={agreement}
                      onChange={(e) => setAgreement(e.target.checked)}
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
                    className="btn-primary w-full"
                  >
                    {submitting ? 'Отправка...' : 'Проверить'}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl p-6 mt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-2">Что можно узнать по IMEI?</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Оригинальность устройства Apple</li>
                    <li>• Дату покупки и активации</li>
                    <li>• Остаток гарантии</li>
                    <li>• Модель и цвет устройства</li>
                    <li>• Блокировку iCloud</li>
                    <li>• Статус в базе утерянных устройств</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
