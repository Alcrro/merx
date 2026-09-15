'use client'

import { createContext, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'

export interface CartItem {
  variantId: string
  productId: string
  productTitle: string
  variantTitle: string
  price: number
  quantity: number
  sku: string
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; variantId: string }
  | { type: 'UPDATE_QTY'; variantId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items }
    case 'ADD': {
      const existing = state.items.find((i) => i.variantId === action.item.variantId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
        }
      }
      return { items: [...state.items, action.item] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.variantId !== action.variantId) }
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.variantId !== action.variantId) }
      }
      return {
        items: state.items.map((i) =>
          i.variantId === action.variantId ? { ...i, quantity: action.quantity } : i,
        ),
      }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ slug, children }: { slug: string; children: ReactNode }) {
  // Separate cart per store slug so visiting multiple stores doesn't mix items
  const storageKey = `merx_cart_${slug}`
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) dispatch({ type: 'HYDRATE', items: JSON.parse(stored) as CartItem[] })
    } catch {
      // ignore malformed storage
    }
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state.items))
  }, [state.items, storageKey])

  const count = state.items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        count,
        subtotal,
        addItem: (item) => dispatch({ type: 'ADD', item }),
        removeItem: (variantId) => dispatch({ type: 'REMOVE', variantId }),
        updateQty: (variantId, quantity) => dispatch({ type: 'UPDATE_QTY', variantId, quantity }),
        clear: () => dispatch({ type: 'CLEAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
