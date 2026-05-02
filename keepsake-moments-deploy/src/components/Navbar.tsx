import { Link, NavLink } from 'react-router-dom'
const links = [{ to: '/', label: 'Home' },{ to: '/about', label: 'About' },{ to: '/services/photobooth-rental', label: 'Services' },{ to: '/packages', label: 'Packages' },{ to: '/contact', label: 'Contact' }]
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-burgundy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="font-serif text-2xl tracking-wide text-burgundy-900">Keepsake Moments</Link>
        <nav className="hidden gap-6 md:flex">{links.map((link) => (<NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm transition ${isActive ? 'text-burgundy-900' : 'text-burgundy-600 hover:text-burgundy-900'}`}>{link.label}</NavLink>))}</nav>
        <Link to="/contact" className="rounded-full bg-burgundy-800 px-5 py-2.5 text-sm text-white transition hover:bg-burgundy-700">Enquire now</Link>
      </div>
    </header>
  )
}
