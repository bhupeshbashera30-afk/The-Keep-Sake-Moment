import { useOrders } from '../../hooks/useOrders'

export function AnalyticsPage() {
  const { orders, loading } = useOrders()

  const paid = orders.filter(o => o.payment_status === 'paid')
  const revenue = paid.reduce((s, o) => s + o.total, 0)
  const avgOrder = paid.length ? revenue / paid.length : 0

  // Orders by status
  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.order_status] = (acc[o.order_status] ?? 0) + 1
    return acc
  }, {})

  // Revenue by day (last 7 days)
  const now = Date.now()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - i * 86400000)
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }).reverse()

  const revByDay = days.map(label => {
    const dayOrders = paid.filter(o => {
      const d = new Date(o.created_at)
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) === label
    })
    return { label, value: dayOrders.reduce((s, o) => s + o.total, 0) }
  })

  const maxRev = Math.max(...revByDay.map(d => d.value), 1)

  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-6 font-serif text-3xl text-gray-900">Analytics</h1>

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">₹{revenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Paid Orders</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{paid.length}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">₹{Math.round(avgOrder).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Revenue bar chart */}
          <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-800">Revenue — Last 7 Days</h2>
            <div className="flex items-end gap-3 h-40">
              {revByDay.map(d => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-burgundy-600 transition-all duration-700"
                    style={{ height: `${(d.value / maxRev) * 100}%`, minHeight: d.value > 0 ? '8px' : '2px', opacity: d.value > 0 ? 1 : 0.2 }}
                  />
                  <span className="text-xs text-gray-500 text-center">{d.label}</span>
                  {d.value > 0 && <span className="text-xs font-medium text-gray-700">₹{d.value.toLocaleString('en-IN')}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Orders by status */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-800">Orders by Status</h2>
            <div className="space-y-3">
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600 capitalize">{status}</span>
                  <div className="flex-1 rounded-full bg-gray-100">
                    <div
                      className="h-2.5 rounded-full bg-burgundy-600"
                      style={{ width: `${(count / orders.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
