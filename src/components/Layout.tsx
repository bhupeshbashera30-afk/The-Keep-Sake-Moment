import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { PageLoader } from './PageLoader'
import { ReadingBar } from './ReadingBar'
import { CursorGlow } from './CursorGlow'

export function Layout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <>
      <PageLoader />
      <ReadingBar />
      <CursorGlow />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
