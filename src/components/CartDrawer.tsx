import { useRef, useEffect } from 'react'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

interface Props {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: Props) {
  const { cart, total, updateQty, removeItem, itemCount } = useCart()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={ref}
        role="dialog"
        aria-label="Shopping cart"
        className={`
          fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-burgundy-700" />
            <span className="font-serif text-lg text-burgundy-950">
              Cart
              {itemCount > 0 && (
                <span className="ml-2 rounded-full bg-burgundy-800 px-2 py-0.5 text-xs text-white">
                  {itemCount}
                </span>
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="mb-3 h-12 w-12 text-burgundy-100" />
              <p className="font-serif text-lg text-burgundy-300">Your cart is empty</p>
              <p className="mt-1 text-sm text-burgundy-400">
                Add some beautiful gifts to get started.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map(item => (
                <li key={item.id} className="flex gap-4">
                  <img
                    src={item.image_url || `https://picsum.photos/seed/${item.id}/80/80`}
                    alt={item.name}
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                    width={64}
                    height={64}
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 rounded p-0.5 text-gray-300 transition hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-burgundy-900 tabular-nums">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-burgundy-300 hover:text-burgundy-700"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm tabular-nums text-gray-700">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-burgundy-300 hover:text-burgundy-700"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-5">
            <div className="mb-4 flex justify-between">
              <span className="text-sm font-medium text-gray-700">Subtotal</span>
              <span className="font-serif text-xl text-burgundy-950 tabular-nums">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full rounded-full bg-burgundy-800 py-3.5 text-center text-sm font-medium text-white transition hover:bg-burgundy-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}