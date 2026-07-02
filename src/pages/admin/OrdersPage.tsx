import { useState } from 'react'
import { Search, RefreshCw, ChevronDown, ShoppingBag, Trash2, Mail } from 'lucide-react'
import { useOrders, type Order } from '../../hooks/useOrders'

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

const ORDER_STATUS_OPTIONS = ['processing', 'confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled']

const ORDER_STATUS_COLORS: Record<string, string> = {
  processing: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  preparing: 'bg-orange-100 text-orange-700',
  dispatched: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function OrdersPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { orders, loading, refetch, updateOrderStatus, deleteOrder } = useOrders(debouncedSearch)

  let debounceTimer: ReturnType<typeof setTimeout>
  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => setDebouncedSearch(val), 400)
  }

  const handleStatusChange = async (order: Order, newStatus: string) => {
    setUpdatingId(order.id)
    await updateOrderStatus(order.id, { order_status: newStatus as Order['order_status'] })
    setUpdatingId(null)
  }

  const handlePaymentStatusChange = async (order: Order, newPaymentStatus: string) => {
    setUpdatingId(order.id)
    await updateOrderStatus(order.id, { payment_status: newPaymentStatus as Order['payment_status'] })
    setUpdatingId(null)
  }

  const handleDeleteOrder = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this order? This action cannot be undone.')
    if (!confirmDelete) return
    setUpdatingId(id)
    await deleteOrder(id)
    setUpdatingId(null)
  }

  const handleSendEmail = (order: Order) => {
    const shortId = order.short_id || order.id.slice(0, 8).toUpperCase()
    const subject = encodeURIComponent(`Order Confirmation - #${shortId} | Keepsake Moments`)
    
    // Format list of items
    const itemsList = (order.products || []).map(item => `- ${item.name} (Qty: ${item.qty})`).join('\n')
    
    const body = encodeURIComponent(
      `Dear ${order.customer_name},\n\n` +
      `Thank you for your order with Keepsake Moments!\n\n` +
      `Order Reference ID: #${shortId}\n` +
      `Total Paid: ₹${Number(order.total).toLocaleString('en-IN')}\n` +
      `Payment Status: ${order.payment_status.toUpperCase()}\n` +
      `Order Status: ${order.order_status.toUpperCase()}\n\n` +
      `Items Details:\n${itemsList}\n\n` +
      `Delivery Address:\n${order.address || 'N/A'}\n\n` +
      `You can track the progress of your delivery on our website anytime using the Reference ID below:\n` +
      `Tracking ID: ${order.id}\n` +
      `Track here: ${window.location.origin}/track-order\n\n` +
      `Warm regards,\n` +
      `Keepsake Moments Team`
    )
    
    window.open(`mailto:${order.email || ''}?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">{orders.length} orders found</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
        />
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-2 h-4 w-48 rounded-full bg-gray-100" />
              <div className="h-3 w-32 rounded-full bg-gray-50" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <ShoppingBag className="mb-3 h-10 w-10 text-gray-200" />
          <p className="text-sm text-gray-400">No orders found. Try a different search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {/* Row */}
              <div
                className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50/50"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{order.customer_name}</span>
                    <span className="font-mono text-[10px] text-burgundy-900 bg-burgundy-50 px-1.5 py-0.5 rounded border border-burgundy-100/50">
                      #{order.short_id || order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">{order.email} · {order.phone}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular-nums text-sm font-semibold text-gray-900">
                    ₹{Number(order.total).toLocaleString('en-IN')}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_COLORS[order.payment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.payment_status}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.order_status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.order_status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedId === order.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Order Items */}
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Items</h4>
                      <ul className="space-y-2">
                        {(Array.isArray(order.products) ? order.products : []).map((item, i) => (
                          <li key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{item.name} × {item.qty}</span>
                            <span className="tabular-nums text-gray-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                          </li>
                        ))}
                      </ul>
                      {order.address && (
                        <div className="mt-4 text-xs text-gray-500">
                          <span className="font-medium">Address:</span> {order.address}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-gray-400">
                        <span className="font-medium">Order ID:</span> <span className="font-mono text-gray-600 font-semibold selection:bg-burgundy-100">#{order.short_id || order.id.slice(0, 8).toUpperCase()}</span>
                        <span className="text-[10px] text-gray-400 font-mono ml-2">(UUID: {order.id})</span>
                      </div>
                      {order.razorpay_payment_id && (
                        <div className="mt-1 text-xs text-gray-400">
                          <span className="font-medium">Razorpay ID:</span> {order.razorpay_payment_id}
                        </div>
                      )}
                    </div>

                    {/* Status Update */}
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Update & Actions</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-gray-500">Order Status</label>
                            <select
                              value={order.order_status}
                              onChange={e => handleStatusChange(order, e.target.value)}
                              disabled={updatingId === order.id}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100 disabled:opacity-60"
                            >
                              {ORDER_STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-gray-500">Payment Status</label>
                            <select
                              value={order.payment_status}
                              onChange={e => handlePaymentStatusChange(order, e.target.value)}
                              disabled={updatingId === order.id}
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100 disabled:opacity-60"
                            >
                              {['pending', 'paid', 'failed', 'refunded'].map(p => (
                                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={() => handleSendEmail(order)}
                            className="flex items-center gap-1.5 rounded-xl border border-burgundy-200 bg-burgundy-50 px-3.5 py-2 text-xs font-medium text-burgundy-800 transition hover:bg-burgundy-100"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email Confirmation
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-800 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Order
                          </button>
                        </div>

                        {updatingId === order.id && (
                          <p className="text-xs text-gray-400">Updating…</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
