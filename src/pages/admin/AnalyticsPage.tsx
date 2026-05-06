import { useEffect, useState } from 'react'
import { IndianRupee, TrendingUp, ShoppingBag, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type CategoryRevenue = { category: string; revenue: number; count: number }
type MonthlyRevenue = { month: string; revenue: number; orders: number }

export function AnalyticsPage() {
  const [categoryData, setCategoryData] = useState<CategoryRevenue[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([])
  const [totals, setTotals] = useState({ revenue: 0, orders: 0, avgOrder: 0, products: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return }

      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('total,payment_status,products,created_at').eq('payment_status', 'paid'),
        supabase.from('products').select('id'),
      ])

      const orders = (ordersRes.data ?? []) as Array<{
        total: number
        products: Array<{ category?: string; price: number; qty: number }>
        created_at: string
      }>

      const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)
      const totalOrders = orders.length

      // Category breakdown from order line items
      const catMap: Record<string, { revenue: number; count: number }> = {}
      orders.forEach(order => {
        const items = Array.isArray(order.products) ? order.products : []
        items.forEach(item => {
          const cat = (item as any).category ?? 'other'
          if (!catMap[cat]) catMap[cat] = { revenue: 0, count: 0 }
          catMap[cat].revenue += (item.price ?? 0) * (item.qty ?? 1)
          catMap[cat].count += item.qty ?? 1
        })
      })
      const catArr: CategoryRevenue[] = Object.entries(catMap)
        .map(([category, d]) => ({ category, ...d }))
        .sort((a, b) => b.revenue - a.revenue)

      // Monthly breakdown (last 6 months)
      const monthMap: Record<string, { revenue: number; orders: number }> = {}
      orders.forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
        if (!monthMap[month]) monthMap[month] = { revenue: 0, orders: 0 }
        monthMap[month].revenue += Number(order.total)
        monthMap[month].orders += 1
      })
      const monthArr: MonthlyRevenue[] = Object.entries(monthMap)
        .map(([month, d]) => ({ month, ...d }))
        .slice(-6)

      setCategoryData(catArr)
      setMonthlyData(monthArr)
      setTotals({
        revenue: totalRevenue,
        orders: totalOrders,
        avgOrder: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
        products: productsRes.data?.length ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const maxCatRevenue = Math.max(...categoryData.map(c => c.revenue), 1)
  const maxMonthRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 h-10 w-10 rounded-xl bg-gray-100" />
              <div className="h-6 w-20 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Revenue and order breakdown from paid orders.</p>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: `₹${totals.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-green-50 text-green-700' },
          { label: 'Paid Orders', value: totals.orders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
          { label: 'Avg Order Value', value: `₹${totals.avgOrder.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
          { label: 'Total Products', value: totals.products, icon: Package, color: 'bg-orange-50 text-orange-700' },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-semibold tabular-nums text-gray-900">{kpi.value}</div>
            <div className="mt-0.5 text-xs font-medium text-gray-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Category */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-medium text-gray-900">Revenue by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400">No paid orders yet.</p>
          ) : (
            <div className="space-y-4">
              {categoryData.map(cat => (
                <div key={cat.category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">{cat.category.replace('_', ' ')}</span>
                    <span className="tabular-nums text-gray-900">₹{cat.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-burgundy-600 transition-all duration-500"
                      style={{ width: `${Math.round((cat.revenue / maxCatRevenue) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">{cat.count} items sold</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-medium text-gray-900">Monthly Revenue</h2>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-gray-400">No paid orders yet.</p>
          ) : (
            <div className="flex h-40 items-end gap-2">
              {monthlyData.map(m => (
                <div key={m.month} className="group relative flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t-lg bg-burgundy-600 transition-all duration-500"
                    style={{ height: `${Math.round((m.revenue / maxMonthRevenue) * 100)}%`, minHeight: '4px' }}
                  />
                  <div className="mt-1 text-center">
                    <div className="text-xs text-gray-500">{m.month}</div>
                    <div className="text-xs font-medium text-gray-900 tabular-nums">₹{(m.revenue / 1000).toFixed(0)}k</div>
                  </div>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                    {m.orders} orders · ₹{m.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
