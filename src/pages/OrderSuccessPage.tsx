import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, ShoppingBag, Home, Package } from 'lucide-react'
import { supabase, type Order } from '../lib/supabase'

export function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId || !supabase) { setLoading(false); return }
    supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
      .then(({ data }) => {
        setOrder(data as Order)
        setLoading(false)
      })
  }, [orderId])

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle className="h-10 w-10 text-green-500" strokeWidth={1.5} />
      </div>

      <h1 className="mb-2 font-serif text-4xl text-burgundy-950">
        Order Confirmed!
      </h1>
      <p className="mb-8 text-burgundy-600">
        Thank you for your order. We'll be in touch shortly to confirm your delivery details.
      </p>

      {loading ? (
        <div className="mb-8 animate-pulse rounded-2xl border border-burgundy-100 bg-burgundy-50 p-6">
          <div className="mb-3 h-4 w-32 rounded-full bg-burgundy-200 mx-auto" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-3 rounded-full bg-burgundy-100" />
            ))}
          </div>
        </div>
      ) : order ? (
        <div className="mb-8 rounded-2xl border border-burgundy-100 bg-burgundy-50/60 p-6 text-left">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-burgundy-400">Order ID</p>
              <p className="font-mono text-sm text-burgundy-700">{order.short_id || order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              order.payment_status === 'paid'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
            </span>
          </div>

          <div className="border-t border-burgundy-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-burgundy-400">Items</p>
            <ul className="space-y-1.5">
              {(Array.isArray(order.products) ? order.products : []).map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-burgundy-700">{item.name} × {item.qty}</span>
                  <span className="tabular-nums text-burgundy-900">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-burgundy-100 pt-3">
              <span className="font-medium text-burgundy-900">Total</span>
              <span className="font-serif text-xl text-burgundy-950">
                ₹{Number(order.total).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/shop"
          className="flex items-center justify-center gap-2 rounded-full border border-burgundy-200 px-6 py-3 text-sm font-medium text-burgundy-700 transition hover:bg-burgundy-50"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 rounded-full bg-burgundy-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-burgundy-700"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </section>
  )
}