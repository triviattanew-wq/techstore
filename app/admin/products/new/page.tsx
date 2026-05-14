'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'
import { SafeButton } from '@/components/admin/SafeButton'
import toast from 'react-hot-toast'

interface FormData {
  name: string
  slug: string
  sku: string
  description: string
  shortDesc: string
  price: string
  oldPrice: string
  warranty: string
  categoryId: string
  brandId: string
  isActive: boolean
  isNew: boolean
  isFeatured: boolean
  isHit: boolean
  seoTitle: string
  seoDesc: string
}

interface ImageItem {
  id: string
  url: string
}

interface VariantItem {
  id: string
  color: string
  colorCode: string
  memory: string
  simType: string
  price: string
  stock: number
}

interface CharacteristicItem {
  id: string
  name: string
  value: string
  group: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    sku: '',
    description: '',
    shortDesc: '',
    price: '',
    oldPrice: '',
    warranty: '1 год официальной гарантии Apple',
    categoryId: '',
    brandId: '',
    isActive: true,
    isNew: false,
    isFeatured: false,
    isHit: false,
    seoTitle: '',
    seoDesc: '',
  })
  
  const [images, setImages] = useState<ImageItem[]>([
    { id: '1', url: '' }
  ])
  
  const [variants, setVariants] = useState<VariantItem[]>([
    { id: '1', color: '', colorCode: '', memory: '', simType: '', price: '', stock: 0 }
  ])
  
  const [characteristics, setCharacteristics] = useState<CharacteristicItem[]>([
    { id: '1', name: '', value: '', group: '' }
  ])

  // Загрузка категорий и брендов
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands')
        ])
        
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
        }
        
        if (brandsRes.ok) {
          const data = await brandsRes.json()
          setBrands(data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Ошибка при загрузке категорий и брендов')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Генерация slug из названия
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9а-яё\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }, [])

  // Обработка изменения названия
  const handleNameChange = useCallback((name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
      seoTitle: name ? `${name} — купить в TechStore` : '',
      seoDesc: name ? `Купить ${name} в TechStore. Официальная гарантия, быстрая доставка.` : ''
    }))
  }, [generateSlug])

  // Управление изображениями
  const addImage = useCallback(() => {
    setImages(prev => [...prev, { id: Date.now().toString(), url: '' }])
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }, [])

  const updateImage = useCallback((id: string, url: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, url } : img))
  }, [])

  // Управление вариантами
  const addVariant = useCallback(() => {
    setVariants(prev => [...prev, {
      id: Date.now().toString(),
      color: '',
      colorCode: '',
      memory: '',
      simType: '',
      price: '',
      stock: 0
    }])
  }, [])

  const removeVariant = useCallback((id: string) => {
    setVariants(prev => prev.filter(variant => variant.id !== id))
  }, [])

  const updateVariant = useCallback((id: string, field: keyof VariantItem, value: any) => {
    setVariants(prev => prev.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ))
  }, [])

  // Управление характеристиками
  const addCharacteristic = useCallback(() => {
    setCharacteristics(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      value: '',
      group: ''
    }])
  }, [])

  const removeCharacteristic = useCallback((id: string) => {
    setCharacteristics(prev => prev.filter(char => char.id !== id))
  }, [])

  const updateCharacteristic = useCallback((id: string, field: keyof CharacteristicItem, value: string) => {
    setCharacteristics(prev => prev.map(char => 
      char.id === id ? { ...char, [field]: value } : char
    ))
  }, [])

  // Отправка формы
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Введите название товара')
      return
    }

    if (!formData.categoryId) {
      toast.error('Выберите категорию')
      return
    }

    if (!formData.brandId) {
      toast.error('Выберите бренд')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Введите корректную цену')
      return
    }

    setSaving(true)

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        images: images.filter(img => img.url.trim()).map(img => img.url),
        variants: variants.filter(v => v.color || v.memory || v.simType || v.price).map(v => ({
          color: v.color || null,
          colorCode: v.colorCode || null,
          memory: v.memory || null,
          simType: v.simType || null,
          price: v.price ? parseFloat(v.price) : null,
          stock: v.stock || 0
        })),
        characteristics: characteristics.filter(c => c.name && c.value).map(c => ({
          name: c.name,
          value: c.value,
          group: c.group || 'Основные'
        })),
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        toast.success('Товар создан!')
        router.push('/admin/products')
      } else {
        const error = await response.text()
        toast.error(`Ошибка при создании товара: ${error}`)
      }
    } catch (error) {
      console.error('Create product error:', error)
      toast.error('Ошибка при создании товара')
    } finally {
      setSaving(false)
    }
  }, [formData, images, variants, characteristics, router])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <SafeButton variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </SafeButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Добавить товар</h1>
          <p className="text-gray-600 mt-1">Создание нового товара в каталоге</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Категория <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Бренд <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Выберите бренд</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Введите название товара"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="url-товара"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Артикул</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SKU товара"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Цена <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Старая цена</label>
              <input
                type="number"
                value={formData.oldPrice}
                onChange={(e) => setFormData({...formData, oldPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Гарантия</label>
              <input
                type="text"
                value={formData.warranty}
                onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1 год официальной гарантии"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Краткое описание</label>
            <textarea
              value={formData.shortDesc}
              onChange={(e) => setFormData({...formData, shortDesc: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
              placeholder="Краткое описание товара"
            />
          </div>
        </div>

        {/* Изображения */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Изображения</h2>
            <SafeButton type="button" onClick={addImage} variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
              Добавить
            </SafeButton>
          </div>
          <div className="space-y-3">
            {images.map((image, index) => (
              <div key={image.id} className="flex gap-3">
                <input
                  type="text"
                  value={image.url}
                  onChange={(e) => updateImage(image.id, e.target.value)}
                  placeholder={`URL изображения ${index + 1} (например: /img/16black.jpg.webp)`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {images.length > 1 && (
                  <SafeButton
                    type="button"
                    onClick={() => removeImage(image.id)}
                    variant="danger"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </SafeButton>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Варианты */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Варианты товара</h2>
            <SafeButton type="button" onClick={addVariant} variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
              Добавить
            </SafeButton>
          </div>
          <div className="space-y-4">
            {variants.map((variant) => (
              <div key={variant.id} className="grid md:grid-cols-7 gap-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={variant.color}
                  onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                  placeholder="Цвет"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={variant.colorCode}
                  onChange={(e) => updateVariant(variant.id, 'colorCode', e.target.value)}
                  placeholder="#000000"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={variant.memory}
                  onChange={(e) => updateVariant(variant.id, 'memory', e.target.value)}
                  placeholder="Память"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={variant.simType}
                  onChange={(e) => updateVariant(variant.id, 'simType', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Тип SIM</option>
                  <option value="SIM+eSIM">SIM+eSIM</option>
                  <option value="eSIM">eSIM</option>
                </select>
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                  placeholder="Цена"
                  min="0"
                  step="0.01"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                  placeholder="Остаток"
                  min="0"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {variants.length > 1 && (
                  <SafeButton
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    variant="danger"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </SafeButton>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Характеристики */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Характеристики</h2>
            <SafeButton type="button" onClick={addCharacteristic} variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
              Добавить
            </SafeButton>
          </div>
          <div className="space-y-4">
            {characteristics.map((char) => (
              <div key={char.id} className="grid md:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={char.name}
                  onChange={(e) => updateCharacteristic(char.id, 'name', e.target.value)}
                  placeholder="Название"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={char.value}
                  onChange={(e) => updateCharacteristic(char.id, 'value', e.target.value)}
                  placeholder="Значение"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={char.group}
                  onChange={(e) => updateCharacteristic(char.id, 'group', e.target.value)}
                  placeholder="Группа"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {characteristics.length > 1 && (
                  <SafeButton
                    type="button"
                    onClick={() => removeCharacteristic(char.id)}
                    variant="danger"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </SafeButton>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Настройки */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Настройки</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Активен</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Новинка</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Рекомендуемый</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isHit}
                onChange={(e) => setFormData({...formData, isHit: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Хит продаж</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <SafeButton type="submit" loading={saving} variant="primary">
            <Save className="w-4 h-4" />
            {saving ? 'Создание...' : 'Создать товар'}
          </SafeButton>
          <Link href="/admin/products">
            <SafeButton type="button" variant="secondary">
              Отмена
            </SafeButton>
          </Link>
        </div>
      </form>
    </div>
  )
}