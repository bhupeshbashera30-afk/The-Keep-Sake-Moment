import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, updateQty, removeItem, total, itemCount } = useCart()

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-burgundy-950/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-burgundy-100 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-burgundy-700" />
            <h2 className="font-serif text-xl text-burgundy-950">Your Cart</h2>
            {itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-burgundy-800 text-xs text-white">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-burgundy-400 hover:bg-burgundy-50 hover:text-burgundy-700"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-12 w-12 text-burgundy-200" />
              <p className="font-serif text-lg text-burgundy-400">Your cart is empty</p>
              <p className="text-sm text-burgundy-400">Add something beautiful</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map(item => (
                <li key={item.id} className="flex items-start gap-4 rounded-2xl border border-burgundy-100 bg-burgundy-50/50 p-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-medium text-burgundy-900">{item.name}</h3>
                    <p className="text-sm text-burgundy-500">₹{item.price.toLocaleString('en-IN')}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-burgundy-200 text-burgundy-600 hover:bg-burgundy-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-burgundy-200 text-burgundy-600 hover:bg-burgundy-100"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-medium text-burgundy-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-burgundy-400 hover:text-burgundy-700"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-burgundy-100 px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-burgundy-600">Total</span>
              <span className="font-serif text-2xl text-burgundy-950">
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
      </aside>
    </>
  )
}
