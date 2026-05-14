'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'
import Link from 'next/link'
import { SafeButton } from '@/components/admin/SafeButton'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string
  shortDesc: string
  price: number
  oldPrice?: number
  categoryId: string
  brandId?: string
  warranty: string
  isActive: boolean
  isNew: boolean
  isFeatured: boolean
  isHit: boolean
  seoTitle: string
  seoDesc: string
  images: Array<{ id: string; url: string; sortOrder: number; isMain: boolean }>
  variants: Array<{
    id: string
    color?: string
    colorCode?: string
    memory?: string
    simType?: string
    price?: number
    stock: number
  }>
  characteristics: Array<{
    id: string
    name: string
    value: string
    group: string
    sortOrder: number
  }>
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    shortDesc: '',
    price: '',
    oldPrice: '',
    categoryId: '',
    brandId: '',
    warranty: '1 год официальной гарантии Apple',
    isActive: true,
    isNew: false,
    isFeatured: false,
    isHit: false,
    seoTitle: '',
    seoDesc: '',
  })
  
  const [images, setImages] = useState<string[]>([''])
  const [variants, setVariants] = useState([
    { id: '', color: '', colorCode: '', memory: '', simType: '', price: '', stock: 0 }
  ])
  const [characteristics, setCharacteristics] = useState([
    { id: '', name: '', value: '', group: '' }
  ])

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`)
      if (res.ok) {
        const productData = await res.json()
        setProduct(productData)
        
        // Заполняем форму данными товара
        setFormData({
          name: productData.name,
          slug: productData.slug,
          sku: productData.sku || '',
          description: productData.description || '',
          shortDesc: productData.shortDesc || '',
          price: productData.price.toString(),
          oldPrice: productData.oldPrice?.toString() || '',
          categoryId: productData.categoryId,
          brandId: productData.brandId || '',
          warranty: productData.warranty || '1 год официальной гарантии Apple',
          isActive: productData.isActive,
          isNew: productData.isNew,
          isFeatured: productData.isFeatured,
          isHit: productData.isHit,
          seoTitle: productData.seoTitle || '',
          seoDesc: productData.seoDesc || '',
        })
        
        setImages(productData.images.map((img: any) => img.url))
        
        const loadedVariants = productData.variants.map((variant: any) => ({
          id: variant.id,
          color: variant.color || '',
          colorCode: variant.colorCode || '',
          memory: variant.memory || '',
          simType: variant.simType || '',
          price: variant.price?.toString() || '',
          stock: variant.stock || 0
        }))
        
        setVariants(loadedVariants.length > 0 ? loadedVariants : [
          { id: '', color: '', colorCode: '', memory: '', simType: '', price: '', stock: 0 }
        ])
        setCharacteristics(productData.characteristics.map((char: any) => ({
          id: char.id,
          name: char.name,
          value: char.value,
          group: char.group || ''
        })))
      } else {
        toast.error('Товар не найден')
        router.push('/admin/products')
      }
    } catch (error) {
      toast.error('Ошибка при загрузке товара')
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }, [productId, router])

  useEffect(() => {
    // Загрузка категорий и брендов
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => setCategories([]))
    fetch('/api/brands').then(r => r.json()).then(setBrands).catch(() => setBrands([]))
    
    // Загрузка товара
    fetchProduct()
  }, [fetchProduct])

  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9а-яё\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }, [])

  const handleNameChange = useCallback((name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
      seoTitle: `${name} — купить в TechStore`,
      seoDesc: `Купить ${name} в TechStore. Официальная гарантия, быстрая доставка.`
    }))
  }, [generateSlug])

  const addImage = useCallback(() => setImages([...images, '']), [images])
  const removeImage = useCallback((index: number) => setImages(images.filter((_, i) => i !== index)), [images])
  const updateImage = useCallback((index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }, [images])

  const addVariant = useCallback(() => setVariants([...variants, { id: '', color: '', colorCode: '', memory: '', simType: '', price: '', stock: 0 }]), [variants])
  const removeVariant = useCallback((index: number) => setVariants(variants.filter((_, i) => i !== index)), [variants])
  const updateVariant = useCallback((index: number, field: string, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }, [variants])

  const addCharacteristic = useCallback(() => setCharacteristics([...characteristics, { id: '', name: '', value: '', group: '' }]), [characteristics])
  const removeCharacteristic = useCallback((index: number) => setCharacteristics(characteristics.filter((_, i) => i !== index)), [characteristics])
  const updateCharacteristic = useCallback((index: number, field: string, value: string) => {
    const newChars = [...characteristics]
    newChars[index] = { ...newChars[index], [field]: value }
    setCharacteristics(newChars)
  }, [characteristics])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        images: images.filter(img => img.trim()),
        variants: variants.filter(v => v.color || v.memory || v.simType || v.price),
        characteristics: characteristics.filter(c => c.name && c.value),
      }

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (res.ok) {
        toast.success('Товар обновлен!')
        router.push('/admin/products')
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Ошибка при обновлении товара')
      }
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error('Ошибка при обновлении товара: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setSaving(false)
    }
  }, [formData, images, variants, characteristics, productId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Товар не найден</h2>
        <Link href="/admin/products" className="btn-primary">
          Вернуться к списку товаров
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <SafeButton variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </SafeButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Редактировать товар</h1>
          <p className="text-gray-600 mt-1">Изменение информации о товаре</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Артикул</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Цена *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Старая цена</label>
              <input
                type="number"
                value={formData.oldPrice}
                onChange={(e) => setFormData({...formData, oldPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Категория *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Бренд</label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">Выберите бренд</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Краткое описание</label>
            <textarea
              value={formData.shortDesc}
              onChange={(e) => setFormData({...formData, shortDesc: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg h-20"
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
          <div className="space-y-2">
            {images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="URL изображения или путь к файлу"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                />
                {images.length > 1 && (
                  <SafeButton
                    type="button"
                    onClick={() => removeImage(index)}
                    variant="danger"
                    size="sm"
                    className="p-2 !bg-transparent !text-red-500 hover:!bg-red-50"
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
            {variants.map((variant, index) => (
              <div key={index} className="grid md:grid-cols-7 gap-2 p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={variant.color}
                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                  placeholder="Цвет"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  value={variant.colorCode}
                  onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                  placeholder="#000000"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  value={variant.memory}
                  onChange={(e) => updateVariant(index, 'memory', e.target.value)}
                  placeholder="Память"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                />
                <select
                  value={variant.simType}
                  onChange={(e) => updateVariant(index, 'simType', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Тип SIM</option>
                  <option value="SIM+eSIM">SIM+eSIM</option>
                  <option value="eSIM">eSIM</option>
                </select>
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                  placeholder="Цена"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                  placeholder="Остаток"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                />
                {variants.length > 1 && (
                  <SafeButton
                    type="button"
                    onClick={() => removeVariant(index)}
                    variant="danger"
                    size="sm"
                    className="p-2 !bg-transparent !text-red-500 hover:!bg-red-50"
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
            {characteristics.map((char, index) => (
              <div key={index} className="grid md:grid-cols-4 gap-2 p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={char.name}
                  onChange={(e) => updateCharacteristic(index, 'name', e.target.value)}
                  placeholder="Название"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  value={char.value}
                  onChange={(e) => updateCharacteristic(index, 'value', e.target.value)}
                  placeholder="Значение"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  value={char.group}
                  onChange={(e) => updateCharacteristic(index, 'group', e.target.value)}
                  placeholder="Группа"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                />
                {characteristics.length > 1 && (
                  <SafeButton
                    type="button"
                    onClick={() => removeCharacteristic(index)}
                    variant="danger"
                    size="sm"
                    className="p-2 !bg-transparent !text-red-500 hover:!bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </SafeButton>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Флаги */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Настройки</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              Активен
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
              />
              Новинка
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
              />
              Рекомендуемый
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isHit}
                onChange={(e) => setFormData({...formData, isHit: e.target.checked})}
              />
              Хит продаж
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <SafeButton type="submit" loading={saving} variant="primary">
            <Save className="w-4 h-4" />
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
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