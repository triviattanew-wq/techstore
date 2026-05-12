'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    agreement: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    if (!formData.name || formData.name.length < 2) newErrors.name = 'Введите имя'
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Введите телефон'
    if (!formData.agreement) newErrors.agreement = 'Необходимо согласие'
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        toast.success('Сообщение отправлено!')
        setFormData({ name: '', phone: '', email: '', message: '', agreement: false })
      } else {
        toast.error('Ошибка при отправке')
      }
    } catch {
      toast.error('Ошибка при отправке')
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
        <label className="block text-sm font-medium mb-1.5">Сообщение</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="input-field resize-none h-24"
          placeholder="Ваше сообщение"
        />
      </div>

      <label className={cn("flex items-start gap-2 text-sm", errors.agreement && "text-red-500")}>
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

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  )
}
