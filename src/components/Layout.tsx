import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen bg-parchment text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-4 top-4 z-50 rounded-full bg-white px-4 py-2 text-sm shadow-soft">Skip to content</a>
      <Navbar />
      <main id="main-content"><Outlet /></main>
      <Footer />
    </div>
  )
}
