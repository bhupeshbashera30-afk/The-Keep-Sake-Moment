import { useEffect, useState } from 'react'
import { ShoppingBag, Package, IndianRupee, Clock, TrendingUp, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Stats = {
  totalRevenue: number
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  totalProducts: number
  activeProducts: number
  recentOrders: Array<{
    id: string
    customer_name: string
    total: number
    payment_status: string
    order_status: string
    created_at: string
  }>
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  processing: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  preparing: 'bg-orange-100 text-orange-700',
  dispatched: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function OverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (!supabase) { setLoading(false); return }

      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('id,customer_name,total,payment_status,order_status,created_at').order('created_at', { ascending: false }),
        supabase.from('products').select('id,is_active'),
      ])

      const orders = ordersRes.data ?? []
      const products = productsRes.data ?? []

      const paid = orders.filter((o: any) => o.payment_status === 'paid')
      const revenue = paid.reduce((s: number, o: any) => s + Number(o.total), 0)

      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        paidOrders: paid.length,
        pendingOrders: orders.filter((o: any) => o.payment_status === 'pending').length,
        totalProducts: products.length,
        activeProducts: products.filter((p: any) => p.is_active).length,
        recentOrders: orders.slice(0, 8) as Stats['recentOrders'],
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      sub: `${stats.paidOrders} paid orders`,
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      sub: `${stats.pendingOrders} pending`,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      icon: Package,
      sub: `${stats.activeProducts} active`,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Conversion',
      value: stats.totalOrders ? `${Math.round((stats.paidOrders / stats.totalOrders) * 100)}%` : '—',
      icon: TrendingUp,
      sub: 'paid / total orders',
      color: 'bg-orange-50 text-orange-700',
    },
  ]

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 h-10 w-10 rounded-xl bg-gray-100" />
              <div className="mb-2 h-7 w-24 rounded-lg bg-gray-100" />
              <div className="h-3 w-32 rounded-full bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back — here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-semibold tabular-nums text-gray-900">{kpi.value}</div>
            <div className="mt-0.5 text-xs font-medium text-gray-500">{kpi.label}</div>
            <div className="mt-1 text-xs text-gray-400">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-medium text-gray-900">Recent Orders</h2>
          <span className="text-xs text-gray-400">{stats.recentOrders.length} shown</span>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="mb-3 h-8 w-8 text-gray-200" />
            <p className="text-sm text-gray-400">No orders yet. They'll appear here once customers place them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-left text-xs text-gray-400">
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Payment</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{order.customer_name}</td>
                    <td className="px-6 py-3 tabular-nums text-gray-700">₹{Number(order.total).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[order.payment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.order_status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
