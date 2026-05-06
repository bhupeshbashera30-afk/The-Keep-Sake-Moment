import { useEffect, useState } from 'react'
import { Link, useNavigate, Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut, Menu, X, TrendingUp
} from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
]

export function AdminLayout() {
  const { isAdmin, loading, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin')
  }, [isAdmin, loading, navigate])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-burgundy-200 border-t-burgundy-700" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-burgundy-950 text-white transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-burgundy-800/50 px-5 py-5">
          <span className="font-serif text-lg">Keepsake Admin</span>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-burgundy-700/60 text-white'
                    : 'text-burgundy-300 hover:bg-burgundy-800/40 hover:text-white'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-burgundy-800/50 p-4">
          <button
            onClick={async () => { await signOut(); navigate('/admin') }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-burgundy-300 transition hover:bg-burgundy-800/40 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center bg-burgundy-950 px-4 py-3 text-white md:hidden">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
        <span className="ml-3 font-serif">Keepsake Admin</span>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
