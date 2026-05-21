import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ScrollReveal } from '../components/ScrollReveal'
import { supabase, type ServiceRecord } from '../lib/supabase'
import { applyImageFallback, imageFallbackSource } from '../lib/imageFallbacks'
import { EVENT_DECOR_SUBPAGES, serviceCategoryBySlug } from '../lib/siteConfig'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export function ServicesPage() {
  const { slug = 'photobooth-rental' } = useParams()
  const meta = serviceCategoryBySlug(slug)

  const [items, setItems] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (!supabase) { setLoading(false); return }

    async function fetchData() {
      try {
        const { data } = await supabase!.from('products').select('*').eq('is_active', true).eq('category', slug)

        if (data) {
          const mapped = data.map(p => ({
            id: p.id as unknown as number, // Using the string ID temporarily for rendering
            name: p.name,
            slug: p.id,
            category_id: 0,
            short_description: p.description || '',
            full_description: p.description || '',
            hero_image: null,
            gallery_images: null,
            starting_price: p.price,
            price_model: p.price > 0 ? 'Fixed' : 'Custom quote',
            is_featured: false,
            sort_order: 99,
            is_active: true,
            pricing_type: p.price > 0 ? 'fixed' : 'custom',
            price: p.price,
            currency: 'INR',
            accept_payment: p.price > 0,
            payment_type: null,
            advance_amount: null,
            image_url: p.image_url,
            created_at: p.created_at
          } as unknown as ServiceRecord))
          setItems(mapped)
        } else {
          setItems([])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  if (!meta) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-20 md:px-8">
        <h1 className="font-serif text-5xl text-burgundy-950">Service not found</h1>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-burgundy-800 px-5 py-3 text-sm text-white">
          Go home
        </Link>
      </section>
    )
  }

  const eyebrow = meta.label
  const description = meta.description

  return (
    <div className="overflow-hidden">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative border-b border-burgundy-100 bg-[radial-gradient(circle_at_top_right,_rgba(126,48,71,0.12),_transparent_50%),linear-gradient(180deg,#f7f1ee_0%,#fff_100%)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <ScrollReveal direction="up">
            <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">Service</p>
            <h1 className="mt-4 font-serif text-5xl text-burgundy-950 md:text-7xl">{eyebrow}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-burgundy-700 md:text-lg">{description}</p>
          </ScrollReveal>

          {slug === 'event-and-decor' && (
            <ScrollReveal direction="up" delay={150}>
              <div className="mt-8 flex flex-wrap gap-2">
                {EVENT_DECOR_SUBPAGES.map((sub) => (
                  <Link
                    key={sub.slug}
                    to={`/services/event-and-decor/${sub.slug}`}
                    className="rounded-full border border-burgundy-200 bg-white px-4 py-2 text-sm text-burgundy-700 transition hover:border-burgundy-500 hover:text-burgundy-900 hover:shadow-soft"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Service Items ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-burgundy-100 bg-white p-2.5 md:rounded-[2rem] md:p-8">
                <div className="h-28 w-full rounded-lg bg-burgundy-50 sm:h-36 md:h-48 md:rounded-2xl" />
                <div className="mt-4 h-4 w-24 rounded-full bg-burgundy-100" />
                <div className="mt-3 h-6 w-48 rounded-full bg-burgundy-100" />
                <div className="mt-3 h-20 rounded-2xl bg-burgundy-50" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
            {items.map((item, idx) => (
              <ScrollReveal key={item.id} direction="up" delay={(idx % 3) * 100} className="h-full">
                <ServiceCard item={item} categorySlug={slug} categoryName={eyebrow} hidePricing={meta.hidePricing} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <p className="text-sm text-burgundy-600">No services found for this category yet.</p>
        )}
      </section>


    </div>
  )
}

function ServiceCard({ item, categorySlug, categoryName, hidePricing = false }: { item: ServiceRecord, categorySlug: string, categoryName: string, hidePricing?: boolean }) {
  const price = item.price ?? item.starting_price
  const currency = item.currency ?? 'INR'
  const numericPrice = Number(price)
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0
  const isFixed = item.pricing_type === 'fixed' && item.accept_payment && hasPrice
  
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({ id: String(item.id), name: item.name, price: numericPrice, image_url: item.image_url ?? undefined, category: categorySlug })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleBuyNow = () => {
    addItem({ id: String(item.id), name: item.name, price: numericPrice, image_url: item.image_url ?? undefined, category: categorySlug })
    navigate('/checkout')
  }

  return (
    <article className="card-lift group flex h-full flex-col overflow-hidden rounded-xl border border-burgundy-100 bg-white p-2 shadow-soft md:rounded-[2rem]">
      <Link to={`/product/${item.id}`} className="aspect-[4/3] w-full block overflow-hidden rounded-lg bg-burgundy-50 md:rounded-[1.5rem]">
        <img
          src={item.image_url ?? item.hero_image ?? imageFallbackSource(String(item.id), categorySlug)}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => applyImageFallback(event, imageFallbackSource(String(item.id), categorySlug))}
        />
      </Link>
      
      <div className="flex flex-1 flex-col px-1 py-2 pb-1 md:px-6 md:py-6 md:pb-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-burgundy-500 line-clamp-1 md:text-xs md:tracking-[0.35em]">{item.price_model ?? ''}</p>
        <Link to={`/product/${item.id}`} className="group-hover:opacity-80">
          <h3 className="mt-1 font-serif text-xs leading-snug text-burgundy-950 line-clamp-2 md:mt-2 md:text-2xl">{item.name}</h3>
        </Link>
        <p className="mt-1.5 flex-1 text-[11px] leading-5 text-burgundy-700 line-clamp-3 md:mt-3 md:text-sm md:leading-7 md:line-clamp-none">{item.short_description}</p>

        {!hidePricing && hasPrice && (
          <p className="mt-2 font-serif text-sm text-burgundy-900 md:mt-4 md:text-2xl">
            {currency === 'INR' ? '₹' : currency}
            {numericPrice.toLocaleString('en-IN')}
          </p>
        )}

        <div className="mt-2 md:mt-6">
          {categorySlug === 'dinner-night' && hasPrice ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={handleAdd}
                className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition md:px-5 md:py-2.5 md:text-sm ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-burgundy-800 text-white hover:bg-burgundy-700'
                }`}
              >
                {added ? '✓ Added' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-full border border-burgundy-800 bg-white px-3 py-1.5 text-[11px] font-medium text-burgundy-800 transition hover:bg-burgundy-50 md:px-5 md:py-2.5 md:text-sm"
              >
                Pay Now
              </button>
            </div>
          ) : isFixed ? (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { service: categoryName, notes: `I would like to book: ${item.name}` } }))}
              className="btn-magnetic block w-full rounded-full bg-burgundy-800 px-3 py-1.5 text-center text-[11px] text-white transition hover:bg-burgundy-700 md:px-5 md:py-3 md:text-sm"
            >
              Book now
            </button>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { service: categoryName, notes: `I am interested in: ${item.name}` } }))}
              className="btn-magnetic block w-full rounded-full border border-burgundy-300 px-3 py-1.5 text-center text-[11px] text-burgundy-800 transition hover:border-burgundy-500 hover:bg-burgundy-50 md:px-5 md:py-3 md:text-sm"
            >
              Enquire
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
