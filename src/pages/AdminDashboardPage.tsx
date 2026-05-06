import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/products',  icon: Package,         label: 'Products' },
  { to: '/admin/orders',    icon: ShoppingBag,     label: 'Orders' },
  { to: '/admin/analytics', icon: BarChart2,       label: 'Analytics' },
]

export function AdminLayout() {
  const { session, isAdmin, loading, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-200 bg-white
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
          <svg viewBox="0 0 32 32" className="h-7 w-7 flex-shrink-0" fill="none">
            <rect width="32" height="32" rx="8" fill="#6b1e2f"/>
            <path d="M16 7 L22 13 L16 19 L10 13 Z" fill="white" opacity="0.9"/>
            <path d="M10 13 L16 19 L16 25 L10 19 Z" fill="white" opacity="0.5"/>
            <path d="M22 13 L16 19 L16 25 L22 19 Z" fill="white" opacity="0.7"/>
          </svg>
          <div>
            <div className="text-sm font-semibold text-gray-900">Keepsake</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {NAV.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
                    ${isActive
                      ? 'bg-burgundy-800 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sign out */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={async () => { await signOut(); navigate('/admin') }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 transition hover:bg-red-50 hover:text-red-600"
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
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">Keepsake Admin</span>
          <div className="w-9" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}