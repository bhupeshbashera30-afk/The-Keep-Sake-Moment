import { Link } from 'react-router-dom'
export function Footer() {
  return (
    <footer className="border-t border-burgundy-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div><p className="font-serif text-2xl text-burgundy-900">Keepsake Moments</p><p className="mt-3 max-w-sm text-sm leading-7 text-burgundy-600">Premium event styling, curated gifting, intimate dinner experiences, and memorable celebration design.</p></div>
        <div><p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">Navigate</p><div className="mt-4 flex flex-col gap-2 text-sm text-burgundy-700"><Link to="/about">About</Link><Link to="/packages">Packages</Link><Link to="/contact">Contact</Link></div></div>
        <div><p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">Services</p><div className="mt-4 flex flex-col gap-2 text-sm text-burgundy-700"><Link to="/services/photobooth-rental">Photobooth Rental</Link><Link to="/services/hampers-and-flower">Hampers & Flower</Link><Link to="/services/dinner-night">Dinner Night</Link><Link to="/services/event-and-decor">Event & Decor</Link></div></div>
      </div>
    </footer>
  )
}
