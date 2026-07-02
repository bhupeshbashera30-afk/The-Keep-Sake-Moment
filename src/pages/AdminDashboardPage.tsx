import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2, LogOut, Menu, CalendarDays,
  MessageSquare, CreditCard, Users, Settings, Bell, ChevronDown, Gift, Image
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { supabase } from '../lib/supabase'

const NAV_GROUPS = [
  {
    title: 'Store',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/products', icon: Package, label: 'Products' },
      { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
      { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    ],
  },
  {
    title: 'Services',
    items: [
      { to: '/admin/enquiries', icon: MessageSquare, label: 'Event Enquiries' },
      { to: '/admin/bookings', icon: Gift, label: 'Bookings' },
    ],
  },
  {
    title: 'Support',
    items: [
      { to: '/admin/support', icon: MessageSquare, label: 'Customer Support' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/admin/homepage-images', icon: Image, label: 'Homepage Images' },
      { to: '', icon: CreditCard, label: 'Payments' },
      { to: '', icon: Users, label: 'Users & Roles' },
      { to: '', icon: Settings, label: 'Settings' },
    ],
  },
]

const todayIso = new Date().toISOString().slice(0, 10)

function offsetDateIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  return `${new Date(`${start}T00:00:00`).toLocaleDateString('en-US', options)} - ${new Date(`${end}T00:00:00`).toLocaleDateString('en-US', options)}`
}

export function AdminLayout() {
  const { session, isAdmin, loading, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dateMenuOpen, setDateMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: offsetDateIso(-30),
    end: todayIso,
  })
  const [activeSupportCount, setActiveSupportCount] = useState(0)

  // Fetch initial active support count and subscribe
  useEffect(() => {
    if (!session || !supabase) return
    const client = supabase!

    const fetchActiveCount = async () => {
      try {
        const { count, error } = await client
          .from('support_threads')
          .select('*', { count: 'exact', head: true })
          .in('status', ['open', 'pending'])
        if (!error && count !== null) {
          setActiveSupportCount(count)
        }
      } catch (err) {
        console.error('Error fetching support count:', err)
      }
    }

    fetchActiveCount()

    // Subscribe to support_threads changes
    const channel = client
      .channel('realtime-support-counter')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_threads' },
        () => {
          fetchActiveCount()
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-burgundy-700 border-t-transparent" />
      </div>
    )
  }

  // Not logged in → back to /admin login
  if (!session) return <Navigate to="/admin" replace />
  // Logged in but not admin → unauthorized
  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center">
        <p className="text-lg font-medium text-gray-800">Access denied.</p>
        <p className="text-sm text-gray-500">Your account does not have admin privileges.</p>
        <button
          onClick={async () => { await signOut(); navigate('/admin') }}
          className="rounded-xl bg-burgundy-800 px-5 py-2.5 text-sm text-white hover:bg-burgundy-700"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-parchment font-sans text-ink">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-burgundy-100 bg-white/90 shadow-soft backdrop-blur-xl
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-burgundy-100 px-5">
          <svg viewBox="0 0 32 32" className="h-7 w-7 flex-shrink-0" fill="none">
            <rect width="32" height="32" rx="8" fill="#6b1e2f"/>
            <path d="M16 7 L22 13 L16 19 L10 13 Z" fill="white" opacity="0.9"/>
            <path d="M10 13 L16 19 L16 25 L10 19 Z" fill="white" opacity="0.5"/>
            <path d="M22 13 L16 19 L16 25 L22 19 Z" fill="white" opacity="0.7"/>
          </svg>
          <div>
            <div className="text-base font-semibold text-burgundy-950">Keepsake</div>
            <div className="text-xs text-burgundy-400">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-6">
            {NAV_GROUPS.map(group => (
              <div key={group.title}>
                <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-burgundy-400">{group.title}</div>
                <ul className="space-y-1">
                  {group.items.map(({ to, icon: Icon, label }) => (
                    <li key={`${group.title}-${label}`}>
                      {to ? (
                        <NavLink
                          to={to}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
                            ${isActive
                              ? 'bg-burgundy-800 text-white shadow-glow'
                              : 'text-burgundy-950/70 hover:bg-burgundy-50 hover:text-burgundy-900'
                            }`
                          }
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span>{label}</span>
                          {label === 'Customer Support' && activeSupportCount > 0 && (
                            <span className="ml-auto rounded-full bg-burgundy-100 px-2 py-0.5 text-[10px] font-bold text-burgundy-900 border border-burgundy-200">
                              {activeSupportCount}
                            </span>
                          )}
                        </NavLink>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-burgundy-950/35"
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Sign out */}
        <div className="border-t border-burgundy-100 p-4">
          <button
            onClick={async () => { await signOut(); navigate('/admin') }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-burgundy-950/60 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-16 items-center justify-between border-b border-burgundy-100 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-burgundy-700 hover:bg-burgundy-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-burgundy-950">Keepsake Admin</span>
          <div className="w-9" />
        </header>

        <header className="hidden h-20 shrink-0 items-center justify-end gap-4 border-b border-burgundy-100 bg-white/60 px-8 backdrop-blur-xl lg:flex">
          <div className="relative">
            <button
              onClick={() => {
                setDateMenuOpen(open => !open)
                setNotificationOpen(false)
              }}
              className="flex items-center gap-2 rounded-lg border border-burgundy-100 bg-white px-4 py-2 text-sm text-burgundy-950 shadow-sm"
            >
              <CalendarDays className="h-4 w-4 text-burgundy-500" />
              {formatRange(dateRange.start, dateRange.end)}
              <ChevronDown className={`h-4 w-4 text-burgundy-400 transition ${dateMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {dateMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-lg border border-burgundy-100 bg-white p-3 shadow-soft">
                <div className="grid gap-3">
                  <label className="space-y-1 text-xs font-medium text-burgundy-950/60">
                    Start date
                    <input
                      type="date"
                      value={dateRange.start}
                      max={dateRange.end}
                      onChange={event => setDateRange(range => ({ ...range, start: event.target.value }))}
                      className="w-full rounded-lg border border-burgundy-100 bg-white px-3 py-2 text-sm text-burgundy-950 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-100"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-burgundy-950/60">
                    End date
                    <input
                      type="date"
                      value={dateRange.end}
                      min={dateRange.start}
                      max={todayIso}
                      onChange={event => setDateRange(range => ({ ...range, end: event.target.value }))}
                      className="w-full rounded-lg border border-burgundy-100 bg-white px-3 py-2 text-sm text-burgundy-950 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-100"
                    />
                  </label>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Today', start: todayIso },
                    { label: '7 days', start: offsetDateIso(-7) },
                    { label: '30 days', start: offsetDateIso(-30) },
                  ].map(range => (
                  <button
                    key={range.label}
                    onClick={() => {
                      setDateRange({ start: range.start, end: todayIso })
                    }}
                    className="rounded-lg bg-burgundy-50 px-2 py-2 text-xs font-medium text-burgundy-700 transition hover:bg-burgundy-100"
                  >
                    {range.label}
                  </button>
                  ))}
                </div>
                <button
                  onClick={() => setDateMenuOpen(false)}
                  className="mt-3 w-full rounded-lg bg-burgundy-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-burgundy-700"
                >
                  Apply range
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(open => !open)
                setDateMenuOpen(false)
              }}
              className="relative rounded-full border border-burgundy-100 bg-white p-2.5 text-burgundy-800 shadow-sm animate-none"
            >
              <Bell className="h-4 w-4" />
              {activeSupportCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {activeSupportCount}
                </span>
              )}
            </button>
            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border border-burgundy-100 bg-white shadow-soft">
                <div className="border-b border-burgundy-100 px-4 py-3">
                  <div className="text-sm font-semibold text-burgundy-950">Notifications</div>
                  <div className="text-xs text-burgundy-950/45">Enquiries, bookings and support</div>
                </div>
                <div className="divide-y divide-burgundy-50">
                  <Link to="/admin/support" onClick={() => setNotificationOpen(false)} className="flex items-start gap-3 px-4 py-3 text-sm transition hover:bg-burgundy-50">
                    <MessageSquare className="mt-0.5 h-4 w-4 text-burgundy-700" />
                    <span>
                      <span className="block font-medium text-burgundy-950">Customer Support ({activeSupportCount})</span>
                      <span className="block text-xs text-burgundy-950/45">Active support conversations</span>
                    </span>
                  </Link>
                  <Link to="/admin/enquiries" onClick={() => setNotificationOpen(false)} className="flex items-start gap-3 px-4 py-3 text-sm transition hover:bg-burgundy-50">
                    <MessageSquare className="mt-0.5 h-4 w-4 text-burgundy-700" />
                    <span>
                      <span className="block font-medium text-burgundy-950">View contact submissions</span>
                      <span className="block text-xs text-burgundy-950/45">Open event enquiry data</span>
                    </span>
                  </Link>
                  <Link to="/admin/bookings" onClick={() => setNotificationOpen(false)} className="flex items-start gap-3 px-4 py-3 text-sm transition hover:bg-burgundy-50">
                    <Gift className="mt-0.5 h-4 w-4 text-burgundy-700" />
                    <span>
                      <span className="block font-medium text-burgundy-950">View booking requests</span>
                      <span className="block text-xs text-burgundy-950/45">Open booking form entries</span>
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-800 text-sm font-semibold text-white">A</div>
            <div>
              <div className="text-sm font-semibold text-burgundy-950">Admin</div>
              <div className="text-xs text-burgundy-400">Administrator</div>
            </div>
            <ChevronDown className="h-4 w-4 text-burgundy-400" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
