import { useEffect, useState } from 'react'
import { ShoppingBag, Package, CreditCard, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useOrders } from '../../hooks/useOrders'

type Stats = {
  totalOrders: number
  paidOrders: number
  totalRevenue: number
  totalProducts: number
}

export function OverviewPage() {
  const { orders, loading: ordersLoading } = useOrders()
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, paidOrders: 0, totalRevenue: 0, totalProducts: 0 })

  useEffect(() => {
    if (!supabase) return
    supabase.from('products').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setStats(prev => ({ ...prev, totalProducts: count ?? 0 }))
    })
  }, [])

  useEffect(() => {
    if (!ordersLoading) {
      const paid = orders.filter(o => o.payment_status === 'paid')
      setStats(prev => ({
        ...prev,
        totalOrders: orders.length,
        paidOrders: paid.length,
        totalRevenue: paid.reduce((s, o) => s + o.total, 0),
      }))
    }
  }, [orders, ordersLoading])

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-burgundy-700 bg-burgundy-100' },
    { label: 'Paid Orders', value: stats.paidOrders, icon: CreditCard, color: 'text-green-700 bg-green-100' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-blue-700 bg-blue-100' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-rose-700 bg-rose-100' },
  ]

  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-2 font-serif text-3xl text-gray-900">Dashboard</h1>
      <p className="mb-8 text-sm text-gray-500">Welcome back — here's what's happening.</p>

      {/* KPI Cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ordersLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 w-24 animate-pulse rounded-full bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.slice(0, 10).map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <PaymentBadge status={order.payment_status} />
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.order_status} />
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  }
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    processing: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>
}
