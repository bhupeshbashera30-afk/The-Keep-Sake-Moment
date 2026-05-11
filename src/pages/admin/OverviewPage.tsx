import { useEffect, useMemo, useState } from 'react'
import {
  BarChart2, CalendarDays, ChevronRight, Clock, IndianRupee,
  Package, ShoppingBag, Sparkles, TrendingUp, Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type Order = {
  id: string
  customer_name: string
  email: string | null
  phone: string | null
  total: number
  payment_status: string
  order_status: string
  created_at: string
}

type Enquiry = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  subject: string
  created_at: string
  source: 'booking' | 'contact'
}

type ChartPoint = {
  label: string
  revenue: number
}

type Stats = {
  totalRevenue: number
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  totalProducts: number
  activeProducts: number
  totalServices: number
  activeServices: number
  recentOrders: Order[]
  recentEnquiries: Enquiry[]
  chartPoints: ChartPoint[]
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-50 text-green-700 ring-green-100',
  pending: 'bg-gold/10 text-gold ring-gold/20',
  failed: 'bg-red-50 text-red-700 ring-red-100',
  refunded: 'bg-gray-100 text-gray-600 ring-gray-200',
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  processing: 'bg-blue-50 text-blue-700 ring-blue-100',
  confirmed: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  preparing: 'bg-orange-50 text-orange-700 ring-orange-100',
  dispatched: 'bg-purple-50 text-purple-700 ring-purple-100',
  shipped: 'bg-purple-50 text-purple-700 ring-purple-100',
  delivered: 'bg-green-50 text-green-700 ring-green-100',
  cancelled: 'bg-red-50 text-red-700 ring-red-100',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTimeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.max(1, Math.floor(diff / 60000))
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function shortOrderId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

function emptyChartPoints() {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (5 - index) * 5)
    return {
      label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: 0,
    }
  })
}

function buildChartPoints(orders: Order[]) {
  const points = emptyChartPoints()
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 30)
  start.setHours(0, 0, 0, 0)

  const bucketMs = (today.getTime() - start.getTime()) / points.length
  orders
    .filter(order => order.payment_status === 'paid')
    .forEach(order => {
      const created = new Date(order.created_at)
      if (created < start || created > today) return
      const index = Math.min(points.length - 1, Math.max(0, Math.floor((created.getTime() - start.getTime()) / bucketMs)))
      points[index].revenue += Number(order.total) || 0
    })

  return points
}

function normalizeBooking(row: any): Enquiry {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    subject: row.service_interest || 'Booking Request',
    created_at: row.created_at,
    source: 'booking',
  }
}

function normalizeContact(row: any): Enquiry {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    subject: row.subject || 'Contact Enquiry',
    created_at: row.created_at,
    source: 'contact',
  }
}

export function OverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalServices: 0,
    activeServices: 0,
    recentOrders: [],
    recentEnquiries: [],
    chartPoints: emptyChartPoints(),
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (!supabase) { setLoading(false); return }

      const [ordersRes, productsRes, servicesRes, bookingRes, contactRes] = await Promise.all([
        supabase.from('orders').select('id,customer_name,email,phone,total,payment_status,order_status,created_at').order('created_at', { ascending: false }),
        supabase.from('products').select('id,is_active'),
        supabase.from('services').select('id,is_active'),
        supabase.from('booking_requests').select('id,full_name,email,phone,service_interest,created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('contact_submissions').select('id,full_name,email,phone,subject,created_at').order('created_at', { ascending: false }).limit(8),
      ])

      const orders = ((ordersRes.data ?? []) as Order[])
      const products = productsRes.data ?? []
      const services = servicesRes.data ?? []
      const bookings = bookingRes.error ? [] : (bookingRes.data ?? []).map(normalizeBooking)
      const contacts = contactRes.error ? [] : (contactRes.data ?? []).map(normalizeContact)
      const enquiries = [...bookings, ...contacts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      const paid = orders.filter(order => order.payment_status === 'paid')
      const revenue = paid.reduce((sum, order) => sum + Number(order.total), 0)

      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        paidOrders: paid.length,
        pendingOrders: orders.filter(order => order.payment_status === 'pending').length,
        totalProducts: products.length,
        activeProducts: products.filter((product: any) => product.is_active).length,
        totalServices: services.length,
        activeServices: services.filter((service: any) => service.is_active).length,
        recentOrders: orders.slice(0, 6),
        recentEnquiries: enquiries,
        chartPoints: buildChartPoints(orders),
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  const chart = useMemo(() => {
    const width = 720
    const height = 190
    const rawMaxRevenue = Math.max(...stats.chartPoints.map(point => point.revenue), 0)
    const maxRevenue = rawMaxRevenue > 0 ? rawMaxRevenue : 50000
    const path = stats.chartPoints.map((point, index) => {
      const x = (index / (stats.chartPoints.length - 1 || 1)) * width
      const y = height - (point.revenue / maxRevenue) * (height - 18)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ')
    const yLabels = Array.from({ length: 6 }, (_, index) => {
      const value = Math.round((maxRevenue / 5) * (5 - index))
      return `₹${value.toLocaleString('en-IN')}`
    })
    return { path, yLabels }
  }, [stats.chartPoints])

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      sub: `${stats.paidOrders} paid orders`,
      color: 'bg-burgundy-50 text-burgundy-800',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      sub: `${stats.pendingOrders} pending`,
      color: 'bg-gold/10 text-gold',
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      icon: Package,
      sub: `${stats.activeProducts} active`,
      color: 'bg-burgundy-100 text-burgundy-700',
    },
    {
      label: 'Services',
      value: stats.totalServices,
      icon: TrendingUp,
      sub: `${stats.activeServices} active`,
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Enquiries',
      value: stats.recentEnquiries.length,
      icon: Clock,
      sub: 'latest captured',
      color: 'bg-amber-50 text-amber-700',
    },
  ]

  const quickActions = [
    { label: 'Add New Product', icon: Package, to: '/admin/products', color: 'bg-burgundy-800' },
    { label: 'View All Orders', icon: ShoppingBag, to: '/admin/orders', color: 'bg-burgundy-700' },
    { label: 'View Analytics', icon: BarChart2, to: '/admin/analytics', color: 'bg-gold' },
    { label: 'View Event Enquiries', icon: Sparkles, to: '/admin/enquiries', color: 'bg-burgundy-500' },
    { label: 'View Bookings', icon: CalendarDays, to: '/admin/bookings', color: 'bg-green-600' },
  ]

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-6 h-10 w-72 animate-pulse rounded-lg bg-burgundy-100" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-burgundy-100 bg-white" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-5 md:p-8">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-burgundy-950">Welcome back, Admin</h1>
          <p className="mt-1 text-sm text-burgundy-950/55">Live overview from your Supabase store data.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-burgundy-100 bg-white px-3 py-2 text-sm text-burgundy-700 shadow-sm lg:hidden">
          <CalendarDays className="h-4 w-4" />
          Last 30 days
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-lg border border-burgundy-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-burgundy-950/55">{kpi.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-burgundy-950">{kpi.value}</div>
            <div className="mt-1 text-xs text-burgundy-950/45">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="rounded-lg border border-burgundy-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-burgundy-950">Sales Overview</h2>
            <span className="rounded-lg border border-burgundy-100 px-3 py-2 text-xs font-medium text-burgundy-700">Last 30 days</span>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3" style={{ height: 236 }}>
              <div className="flex flex-col justify-between py-2 text-xs text-burgundy-950/35">
                {chart.yLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
              </div>
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 38px, rgba(126,48,71,0.12) 39px)' }}
              >
                <svg className="h-full w-full" viewBox="0 0 720 210" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7e3047" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#7e3047" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${chart.path} L 720 210 L 0 210 Z`} fill="url(#salesFill)" />
                  <path d={chart.path} fill="none" stroke="#7e3047" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="ml-20 flex justify-between text-xs text-burgundy-950/45">
              {stats.chartPoints.map(point => <span key={point.label}>{point.label}</span>)}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-burgundy-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-burgundy-950">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map(action => (
              <Link key={action.label} to={action.to} className="flex items-center justify-between rounded-lg border border-burgundy-100 px-3 py-3 text-sm font-medium text-burgundy-950 transition hover:bg-burgundy-50">
                <span className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </span>
                  {action.label}
                </span>
                <ChevronRight className="h-4 w-4 text-burgundy-400" />
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-burgundy-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-burgundy-100 px-5 py-4">
            <h2 className="font-semibold text-burgundy-950">Recent Orders</h2>
            <Link to="/admin/orders" className="rounded-lg border border-burgundy-100 px-3 py-2 text-xs font-medium text-burgundy-700">View All</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-3 h-8 w-8 text-burgundy-200" />
              <p className="text-sm text-burgundy-950/45">No orders yet. They will appear here once customers place them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-burgundy-50 text-left text-xs text-burgundy-950/45">
                    <th className="px-5 py-3 font-medium">Order ID</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-50">
                  {stats.recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-burgundy-50/40">
                      <td className="px-5 py-4 font-medium text-burgundy-950">{shortOrderId(order.id)}</td>
                      <td className="px-5 py-4 text-burgundy-950/75">{order.customer_name}</td>
                      <td className="px-5 py-4 tabular-nums text-burgundy-950">₹{Number(order.total).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${STATUS_COLORS[order.payment_status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${ORDER_STATUS_COLORS[order.order_status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-burgundy-950/45">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="event-enquiries" className="rounded-lg border border-burgundy-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-burgundy-100 px-5 py-4">
            <h2 className="font-semibold text-burgundy-950">Recent Event Enquiries</h2>
            <Link to="/admin/enquiries" className="rounded-lg border border-burgundy-100 px-3 py-2 text-xs font-medium text-burgundy-700">View All</Link>
          </div>
          {stats.recentEnquiries.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-10 text-sm text-burgundy-950/45">
              <Sparkles className="h-5 w-5 text-burgundy-200" />
              New booking and contact enquiries will appear here.
            </div>
          ) : (
            <div className="divide-y divide-burgundy-50">
              {stats.recentEnquiries.map(enquiry => (
                <div key={`${enquiry.source}-${enquiry.id}`} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-burgundy-50 text-burgundy-800">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-burgundy-950">{enquiry.subject}</div>
                      <div className="mt-1 truncate text-xs text-burgundy-950/45">
                        {enquiry.full_name} {enquiry.phone ? `| ${enquiry.phone}` : ''} | {formatTimeAgo(enquiry.created_at)}
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-burgundy-50 px-2.5 py-1 text-xs font-medium capitalize text-burgundy-700">{enquiry.source}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-burgundy-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-burgundy-100 px-5 py-4">
            <h2 className="font-semibold text-burgundy-950">Recent Customers</h2>
            <span className="text-xs text-burgundy-950/45">from orders</span>
          </div>
          <div className="divide-y divide-burgundy-50 px-5">
            {stats.recentOrders.slice(0, 5).map(order => (
              <div key={`customer-${order.id}`} className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-burgundy-100 text-sm font-semibold text-burgundy-800">
                    {order.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-burgundy-950">{order.customer_name}</div>
                    <div className="truncate text-xs text-burgundy-950/45">{order.email || order.phone || 'No contact saved'}</div>
                  </div>
                </div>
                <div className="shrink-0 text-xs text-burgundy-950/45">{formatDate(order.created_at)}</div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <div className="flex items-center gap-3 py-10 text-sm text-burgundy-950/45">
                <Users className="h-5 w-5 text-burgundy-200" />
                Customers will appear here after orders arrive.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
