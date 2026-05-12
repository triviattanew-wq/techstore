'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface CartItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    oldPrice: number | null
    images: { url: string }[]
  }
  quantity: number
  variantId: string | null
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const pathname = usePathname()

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [session, refreshCart])

  const addItem = async (productId: string, quantity = 1, variantId?: string) => {
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, variantId }),
      })
      if (res.ok) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (res.ok) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      })
      if (res.ok) {
        setItems([])
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
