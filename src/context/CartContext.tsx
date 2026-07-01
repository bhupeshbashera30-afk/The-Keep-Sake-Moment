import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image_url?: string
  category?: string
}

// Booking metadata stored alongside the cart for event/service items
export type BookingMeta = {
  productId: string
  productName: string
  productPrice: number
  bookingDate: string      // YYYY-MM-DD
  timeSlot: string         // e.g. '10-12'
  timeSlotLabel: string    // e.g. '10:00 AM – 12:00 PM'
  addons: Array<{ id: string; name: string; price: number }>
  addonsTotal: number
  numPeople: number
  category: string
  image_url?: string
}

type CartContextType = {
  cart: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'>) => void
  updateQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: number
  itemCount: number
  // Booking flow
  bookingMeta: BookingMeta | null
  setBookingMeta: (meta: BookingMeta | null) => void
  bookingTotal: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [bookingMeta, setBookingMeta] = useState<BookingMeta | null>(null)

  const addItem = useCallback((item: Omit<CartItem, 'qty'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty } : i).filter(i => i.qty > 0)
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setBookingMeta(null)
  }, [])

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0)
  
  // Total for booking flow = product price + addons
  const bookingTotal = bookingMeta
    ? bookingMeta.productPrice + bookingMeta.addonsTotal
    : 0

  return (
    <CartContext.Provider value={{
      cart, addItem, updateQty, removeItem, clearCart, total, itemCount,
      bookingMeta, setBookingMeta, bookingTotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
