import { useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useOrders, type Order } from '../../hooks/useOrders'

const PAYMENT_STATUSES = ['all', 'pending', 'paid', 'failed', 'refunded']
const ORDER_STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled']

export function OrdersPage() {
  const { orders, loading, refetch } = useOrders()
  const [search, setSearch] = useState('')
  const [payFilter, setPayFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q || o.customer_name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.id.includes(q)
    const matchPay = payFilter === 'all' || o.payment_status === payFilter
    return matchSearch && matchPay
  })

  const updateOrderStatus = async (id: string, order_status: string) => {
    if (!supabase) return
    setUpdatingId(id)
    await supabase.from('orders').update({ order_status }).eq('id', id)
    refetch()
    setUpdatingId(null)
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-6 font-serif text-3xl text-gray-900">Orders</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, order ID…"
            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-burgundy-400 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {PAYMENT_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setPayFilter(s)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                payFilter === s ? 'bg-burgundy-800 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 w-20 animate-pulse rounded-full bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map(order => (
                    <>
                      <tr
                        key={order.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">{order.email}</p>
                        </td>
                        <td className="px-5 py-4 font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <PayBadge status={order.payment_status} />
                        </td>
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          <select
                            value={order.order_status}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs focus:outline-none"
                          >
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-xs text-burgundy-600">
                          {expandedId === order.id ? 'Hide ↑' : 'Details ↓'}
                        </td>
                      </tr>
                      {expandedId === order.id && (
                        <tr key={order.id + '-detail'} className="bg-gray-50">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Contact</p>
                                <p className="text-sm text-gray-700">{order.phone}</p>
                                <p className="text-sm text-gray-700">{order.address}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Items</p>
                                {order.products.map((item, idx) => (
                                  <p key={idx} className="text-sm text-gray-700">{item.name} × {item.qty} — ₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                                ))}
                              </div>
                              {order.razorpay_payment_id && (
                                <div>
                                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Razorpay ID</p>
                                  <p className="font-mono text-xs text-gray-600">{order.razorpay_payment_id}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-400">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PayBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  }
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>
}
