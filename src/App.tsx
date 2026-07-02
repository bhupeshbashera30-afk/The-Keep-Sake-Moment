import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { ServicesPage } from './pages/ServicesPage'
import { EventDecorSubPage } from './pages/EventDecorSubPage'


import { ShopPage } from './pages/ShopPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminLayout } from './pages/AdminDashboardPage'
import { OverviewPage } from './pages/admin/OverviewPage'
import { ProductsPage } from './pages/admin/ProductsPage'
import { OrdersPage } from './pages/admin/OrdersPage'
import { AnalyticsPage } from './pages/admin/AnalyticsPage'
import { EventEnquiriesPage } from './pages/admin/EventEnquiriesPage'
import { BookingsPage } from './pages/admin/BookingsPage'
import { HomepageImagesPage } from './pages/admin/HomepageImagesPage'
import { TrackOrderPage } from './pages/TrackOrderPage'
import { SupportPage } from './pages/admin/SupportPage'

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
            <Route path="/services/event-and-decor" element={<Navigate to="/services/event-and-decor/all" replace />} />
            <Route path="/services/event-and-decor/:subslug" element={<EventDecorSubPage />} />
            <Route path="/services/:slug" element={<ServicesPage />} />

            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
          </Route>

          {/* Admin routes — completely outside Layout, no navbar/footer */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<OverviewPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/enquiries" element={<EventEnquiriesPage />} />
            <Route path="/admin/bookings" element={<BookingsPage />} />
            <Route path="/admin/homepage-images" element={<HomepageImagesPage />} />
            <Route path="/admin/support" element={<SupportPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </AdminAuthProvider>
  )
}
