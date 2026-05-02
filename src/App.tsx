import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { ServicesPage } from './pages/ServicesPage'
import { EventDecorSubPage } from './pages/EventDecorSubPage'
import { PackagesPage } from './pages/PackagesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services/event-and-decor/:subslug" element={<EventDecorSubPage />} />
        <Route path="/services/:slug" element={<ServicesPage />} />
        <Route path="/packages" element={<PackagesPage />} />
      </Route>
    </Routes>
  )
}
