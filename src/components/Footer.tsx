import { Link } from 'react-router-dom'
import { SERVICE_CATEGORIES, SHOP_CATEGORIES } from '../lib/siteConfig'

const InstagramColorIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2" />
    <circle cx="12" cy="12" r="5" stroke="url(#ig-grad)" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)" />
  </svg>
)

const footerLinks = [
  ...SHOP_CATEGORIES.map((category) => ({ to: `/shop?category=${category.key}`, label: category.label })),
  ...SERVICE_CATEGORIES.map((category) => ({ to: category.route, label: category.label })),
]

export function Footer() {
  return (
    <footer className="border-t border-burgundy-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div><p className="font-serif text-2xl text-burgundy-900">Keepsake Moments</p><p className="mt-3 max-w-sm text-sm leading-7 text-burgundy-600">Premium event styling, curated gifting, intimate dinner experiences, and memorable celebration design.</p></div>
        <div><p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">Navigate</p><div className="mt-4 flex flex-col gap-2 text-sm text-burgundy-700"><Link to="/about">About</Link><Link to="/shop">Shop</Link><Link to="/contact">Contact</Link><a href="https://www.instagram.com/thekeepsakemoment?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-burgundy-900 transition-colors"><InstagramColorIcon className="h-5 w-5" /> Instagram</a></div></div>

        <div><p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">Services</p><div className="mt-4 flex flex-col gap-2 text-sm text-burgundy-700">{footerLinks.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}</div></div>
      </div>
    </footer>
  )
}
