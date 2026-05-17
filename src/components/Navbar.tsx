import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ShoppingBag, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { CartDrawer } from './CartDrawer'
import { InquiryModal } from './InquiryModal'
import { marqueeItems } from '../lib/data'

const serviceLinks = [
  { to: '/services/event-and-decor', label: 'Event & Decor' },
  { to: '/services/photobooth-rental', label: 'Photobooth Rental' },
  { to: '/services/dinner-night', label: 'Dinner Night' },
]

const shopLinks = [
  { to: '/shop?category=flowers', label: 'Flower & Bouquet' },
  { to: '/shop?category=hampers', label: 'Hamper' },
  { to: '/shop?category=crochets', label: 'Crochet' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryProps, setEnquiryProps] = useState<{ service?: string; notes?: string; type?: 'contact' | 'booking'; timestamp?: number }>({})
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)
  const [shopOpen, setShopOpen] = useState(false)
  const shopRef = useRef<HTMLDivElement>(null)
  const { itemCount } = useCart()

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleOpen = (e: any) => {
      const detail = e.detail || {}
      setEnquiryProps({
        service: detail.service,
        notes: detail.notes,
        type: detail.service ? 'booking' : 'contact',
        timestamp: Date.now()
      })
      setEnquiryOpen(true)
    }
    window.addEventListener('open-enquiry', handleOpen)
    return () => window.removeEventListener('open-enquiry', handleOpen)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      {/* ── Marquee (Top Bar) ─────────────────────────────── */}
      <div className="border-b border-burgundy-100 bg-[#faf6f3] py-2 md:py-2.5 overflow-hidden">
        <div className="marquee-track">
          <div className="marquee-inner">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="font-serif text-xs md:text-sm text-burgundy-800 uppercase tracking-[0.2em] select-none px-8"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <header 
        className={`sticky top-0 z-50 ${
          scrolled 
            ? 'bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border-b border-white/50' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="mx-auto flex flex-col items-center px-4 py-4 md:px-8 relative">
          {/* Top section: Mobile flex, Desktop center */}
          <div className="flex w-full items-center justify-between md:justify-center relative">
            
            <Link to="/" className="flex-shrink-0 z-10">
              <img src="/images/logo-transparent-new.png" alt="The Keepsake Moment" className="h-12 w-auto object-contain md:h-24" />
            </Link>



            {/* Mobile: cart + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="relative rounded-full border border-burgundy-100 p-2 text-burgundy-700"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy-800 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                className="flex items-center justify-center rounded-full border border-burgundy-100 p-2 text-burgundy-700"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Lower Row */}
          <div className="hidden md:flex w-full items-center justify-center gap-10 mt-4 relative">
            {/* Desktop Nav */}
            <nav className="flex items-center gap-6">
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

              {/* Services Dropdown */}
              <div className="relative" ref={servicesRef}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition text-burgundy-600 hover:text-burgundy-900`}
                >
                  Services
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>
                {servicesOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-burgundy-100 bg-white p-2 shadow-lg z-50">
                    {serviceLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setServicesOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-xl px-4 py-2.5 text-sm transition ${
                            isActive ? 'bg-burgundy-50 text-burgundy-900 font-medium' : 'text-burgundy-600 hover:bg-burgundy-50 hover:text-burgundy-900'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>


              {/* Shop Dropdown */}
              <div className="relative" ref={shopRef}>
                <button
                  onClick={() => setShopOpen(!shopOpen)}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition text-burgundy-600 hover:text-burgundy-900`}
                >
                  Shop
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
                </button>
                {shopOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-burgundy-100 bg-white p-2 shadow-lg z-50">
                    {shopLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setShopOpen(false)}
                        className={`block rounded-xl px-4 py-2.5 text-sm transition text-burgundy-600 hover:bg-burgundy-50 hover:text-burgundy-900`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

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
            <div className="flex items-center gap-3">
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

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="relative rounded-full border border-burgundy-100 p-2.5 text-burgundy-600 transition hover:bg-burgundy-50 hover:text-burgundy-900"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy-800 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setEnquiryOpen(true)}
                className="rounded-full bg-burgundy-800 px-5 py-2.5 text-sm text-white transition hover:bg-burgundy-700"
              >
                Enquire now
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute left-0 top-full w-full h-[calc(100vh-70px)] bg-white/90 backdrop-blur-lg border-t border-burgundy-100 px-4 pb-24 pt-4 md:hidden overflow-y-auto overscroll-contain">
            <div className="flex flex-col gap-1">
              <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
              <p className="mt-3 mb-1 text-xs uppercase tracking-[0.35em] text-burgundy-400">Services</p>
              {serviceLinks.map((link) => (
                <MobileLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </MobileLink>
              ))}
              <div className="my-2 h-px bg-burgundy-50" />
              <div className="py-2 text-xs font-semibold uppercase tracking-wider text-burgundy-300">Shop</div>
              {shopLinks.map((link) => (
                <MobileLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </MobileLink>
              ))}
              <div className="my-2 h-px bg-burgundy-50" />
              <MobileLink to="/about" onClick={() => setMobileOpen(false)}>About</MobileLink>
              <MobileLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileLink>
              <button
                onClick={() => { setMobileOpen(false); setEnquiryOpen(true) }}
                className="mt-4 rounded-full bg-burgundy-800 px-5 py-3 text-center text-sm text-white transition hover:bg-burgundy-700"
              >
                Enquire now
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer — outside header, renders as overlay */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Inquiry Modal */}
      <InquiryModal 
        open={enquiryOpen} 
        onClose={() => setEnquiryOpen(false)} 
        defaultService={enquiryProps.service} 
        defaultNotes={enquiryProps.notes} 
        submissionType={enquiryProps.type || 'contact'}
        timestamp={enquiryProps.timestamp}
      />
    </>
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
