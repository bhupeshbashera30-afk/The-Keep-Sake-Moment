import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { ServicesPage } from './pages/ServicesPage'
import { EventDecorSubPage } from './pages/EventDecorSubPage'
import { PackagesPage } from './pages/PackagesPage'
import { ShopPage } from './pages/ShopPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminLayout } from './pages/AdminDashboardPage'
import { OverviewPage } from './pages/admin/OverviewPage'
import { ProductsPage } from './pages/admin/ProductsPage'
import { OrdersPage } from './pages/admin/OrdersPage'
import { AnalyticsPage } from './pages/admin/AnalyticsPage'

export default function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <Routes>
          {/* Public routes — wrapped in shared Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/services/event-and-decor/:subslug" element={<EventDecorSubPage />} />
            <Route path="/services/:slug" element={<ServicesPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
          </Route>

          {/* Admin routes — completely outside Layout, no navbar/footer */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<OverviewPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </AdminAuthProvider>
  )
}
