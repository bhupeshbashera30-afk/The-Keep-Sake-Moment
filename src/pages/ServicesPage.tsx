import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ScrollReveal } from '../components/ScrollReveal'
import { supabase, type ServiceRecord } from '../lib/supabase'
import { services as staticServices } from '../lib/data'

const categoryMeta: Record<string, { eyebrow: string; description: string }> = {
  'photobooth-rental': {
    eyebrow: 'Photobooth Rental',
    description:
      'Elegant booth setups styled for social and brand-led events. Pricing is personalised after discussing event scale, setup, and styling direction.',
  },
  'hampers-and-flower': {
    eyebrow: 'Hampers & Flower',
    description:
      'Luxury gifting collections with flowers, curated pairings, and ready-price selections for birthdays, anniversaries, and special occasions.',
  },
  'dinner-night': {
    eyebrow: 'Dinner Night',
    description:
      'Styled dining experiences designed around mood, lighting, and personal atmosphere. Fixed-price setups alongside custom add-ons.',
  },
  'event-and-decor': {
    eyebrow: 'Event & Decor',
    description:
      'Celebration styling for every occasion — birthdays, anniversaries, proposals, corporate events, and special gatherings.',
  },
  'ice-cream-rental': {
    eyebrow: 'Ice Cream Rental',
    description:
      'Premium ice cream cart and sundae bar rentals for events, parties, and celebrations. A sweet, fun addition to make any occasion more memorable.',
  },
}

const decorSubpages = [
  { slug: 'birthday', label: 'Birthday' },
  { slug: 'anniversary', label: 'Anniversary' },
  { slug: 'proposal', label: 'Proposal' },
  { slug: 'corporate', label: 'Corporate Event' },
  { slug: 'special-occasion', label: 'Special Occasion' },
]

export function ServicesPage() {
  const { slug = 'photobooth-rental' } = useParams()
  const meta = categoryMeta[slug]
  const staticFallback = staticServices[slug as keyof typeof staticServices]

  const [items, setItems] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (!supabase) { setLoading(false); return }
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data) {
          const filtered = (data as ServiceRecord[]).filter((s) => {
            if (slug === 'event-and-decor') return s.category_id === 4
            if (slug === 'photobooth-rental') return s.category_id === 1
            if (slug === 'hampers-and-flower') return s.category_id === 2
            if (slug === 'dinner-night') return s.category_id === 3
            if (slug === 'ice-cream-rental') return s.category_id === 5
            if (slug === 'crochets') return s.category_id === 6
            return false
          })
          setItems(filtered)
        }
        setLoading(false)
      })
  }, [slug])

  if (!meta && !staticFallback) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-20 md:px-8">
        <h1 className="font-serif text-5xl text-burgundy-950">Service not found</h1>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-burgundy-800 px-5 py-3 text-sm text-white">
          Go home
        </Link>
      </section>
    )
  }

  const eyebrow = meta?.eyebrow ?? staticFallback?.title ?? slug
  const description = meta?.description ?? staticFallback?.summary ?? ''

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
                {decorSubpages.map((sub) => (
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-[2rem] border border-burgundy-100 bg-white p-8">
                <div className="h-48 w-full rounded-2xl bg-burgundy-50" />
                <div className="mt-4 h-4 w-24 rounded-full bg-burgundy-100" />
                <div className="mt-3 h-6 w-48 rounded-full bg-burgundy-100" />
                <div className="mt-3 h-20 rounded-2xl bg-burgundy-50" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => (
              <ScrollReveal key={item.id} direction="up" delay={(idx % 3) * 100} className="h-full">
                <ServiceCard item={item} categoryName={eyebrow} hidePricing={slug === 'event-and-decor' || slug === 'photobooth-rental'} />
              </ScrollReveal>
            ))}
          </div>
        ) : staticFallback ? (
          <ScrollReveal direction="up">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card-lift rounded-[2rem] border border-burgundy-100 bg-white p-8 shadow-soft">
                <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">Pricing model</p>
                <p className="mt-4 font-serif text-3xl text-burgundy-900">{staticFallback.priceModel}</p>
                <ul className="mt-6 space-y-3">
                  {staticFallback.details.map((d) => (
                    <li key={d} className="rounded-2xl border border-burgundy-100 bg-parchment px-4 py-3 text-sm text-burgundy-700">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <p className="text-sm text-burgundy-600">No services found for this category yet.</p>
        )}
      </section>


    </div>
  )
}

function ServiceCard({ item, categoryName, hidePricing = false }: { item: ServiceRecord, categoryName: string, hidePricing?: boolean }) {
  const price = item.price ?? item.starting_price
  const currency = item.currency ?? 'INR'
  const isFixed = item.pricing_type === 'fixed' && item.accept_payment && price

  return (
    <article className="card-lift group flex h-full flex-col overflow-hidden rounded-[2rem] border border-burgundy-100 bg-white p-2 shadow-soft">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-burgundy-50">
        {item.image_url || item.hero_image ? (
          <img
            src={item.image_url ?? item.hero_image ?? ''}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-3xl text-burgundy-200">KM</div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col px-6 py-6 pb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">{item.price_model ?? ''}</p>
        <h3 className="mt-2 font-serif text-2xl text-burgundy-950">{item.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-burgundy-700">{item.short_description}</p>

        {!hidePricing && price && (
          <p className="mt-4 font-serif text-2xl text-burgundy-900">
            {currency === 'INR' ? '₹' : currency}
            {Number(price).toLocaleString('en-IN')}
          </p>
        )}

        <div className="mt-6">
          {isFixed ? (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { service: categoryName, notes: `I would like to book: ${item.name}` } }))}
              className="btn-magnetic block w-full rounded-full bg-burgundy-800 px-5 py-3 text-center text-sm text-white transition hover:bg-burgundy-700"
            >
              Book now
            </button>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { service: categoryName, notes: `I am interested in: ${item.name}` } }))}
              className="btn-magnetic block w-full rounded-full border border-burgundy-300 px-5 py-3 text-center text-sm text-burgundy-800 transition hover:border-burgundy-500 hover:bg-burgundy-50"
            >
              Enquire
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
