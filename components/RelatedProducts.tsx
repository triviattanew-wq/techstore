import { ProductCard } from './ProductCard'

interface RelatedProductsProps {
  products: {
    id: string
    name: string
    slug: string
    price: number
    oldPrice: number | null
    images: { url: string }[]
  }[]
  title?: string
}

export function RelatedProducts({ products, title = 'С этим товаром покупают' }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <div>
      <h2 className="section-title mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            showQuickBuy={false}
          />
        ))}
      </div>
    </div>
  )
}
