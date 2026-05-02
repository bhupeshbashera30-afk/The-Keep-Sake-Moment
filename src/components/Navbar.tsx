import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const serviceLinks = [
  { to: '/services/photobooth-rental', label: 'Photobooth Rental' },
  { to: '/services/hampers-and-flower', label: 'Hampers & Flower' },
  { to: '/services/dinner-night', label: 'Dinner Night' },
  { to: '/services/event-and-decor', label: 'Event & Decor' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-burgundy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="font-serif text-2xl tracking-wide text-burgundy-900">
          Keepsake Moments
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm transition ${
                isActive ? 'bg-burgundy-50 text-burgundy-900' : 'text-burgundy-600 hover:text-burgundy-900'
              }`
            }
          >
            Home
          </NavLink>

          {serviceLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition ${
                  isActive ? 'bg-burgundy-50 text-burgundy-900' : 'text-burgundy-600 hover:text-burgundy-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <NavLink
            to="/packages"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm transition ${
                isActive ? 'bg-burgundy-50 text-burgundy-900' : 'text-burgundy-600 hover:text-burgundy-900'
              }`
            }
          >
            Packages
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm transition ${
                isActive ? 'bg-burgundy-50 text-burgundy-900' : 'text-burgundy-600 hover:text-burgundy-900'
              }`
            }
          >
            About
          </NavLink>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm transition ${
                isActive ? 'bg-burgundy-50 text-burgundy-900' : 'text-burgundy-600 hover:text-burgundy-900'
              }`
            }
          >
            Contact
          </NavLink>
          <Link
            to="/contact"
            className="rounded-full bg-burgundy-800 px-5 py-2.5 text-sm text-white transition hover:bg-burgundy-700"
          >
            Enquire now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center rounded-full border border-burgundy-100 p-2 text-burgundy-700 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-burgundy-100 bg-white px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-1">
            <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
            <p className="mt-3 mb-1 text-xs uppercase tracking-[0.35em] text-burgundy-400">Services</p>
            {serviceLinks.map((link) => (
              <MobileLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                {link.label}
              </MobileLink>
            ))}
            <p className="mt-3 mb-1 text-xs uppercase tracking-[0.35em] text-burgundy-400">More</p>
            <MobileLink to="/packages" onClick={() => setMobileOpen(false)}>Packages</MobileLink>
            <MobileLink to="/about" onClick={() => setMobileOpen(false)}>About</MobileLink>
            <MobileLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileLink>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-4 rounded-full bg-burgundy-800 px-5 py-3 text-center text-sm text-white transition hover:bg-burgundy-700"
            >
              Enquire now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function MobileLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-2xl px-4 py-3 text-sm transition ${
          isActive ? 'bg-burgundy-50 text-burgundy-900 font-medium' : 'text-burgundy-700 hover:bg-burgundy-50'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
