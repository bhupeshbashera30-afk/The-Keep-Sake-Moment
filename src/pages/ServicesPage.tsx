import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { InquiryForm } from '../components/InquiryForm'
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
          <ScrollReveal stagger>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ServiceCard key={item.id} item={item} />
              ))}
            </div>
          </ScrollReveal>
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

      {/* ── Enquiry ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <ScrollReveal direction="up">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-burgundy-400">Enquiry</p>
              <h2 className="mt-3 font-serif text-4xl text-burgundy-950">Share the basics, then let the team shape the rest.</h2>
              <p className="mt-4 text-sm leading-7 text-burgundy-700">
                This page supports the consultation-first model — especially for custom services and package-based planning.
              </p>
            </div>
            <InquiryForm compact />
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}

function ServiceCard({ item }: { item: ServiceRecord }) {
  const price = item.price ?? item.starting_price
  const currency = item.currency ?? 'INR'
  const isFixed = item.pricing_type === 'fixed' && item.accept_payment && price

  return (
    <article className="card-lift flex flex-col rounded-[2rem] border border-burgundy-100 bg-white p-8 shadow-soft">
      {item.image_url || item.hero_image ? (
        <img
          src={item.image_url ?? item.hero_image ?? ''}
          alt={item.name}
          className="mb-6 h-48 w-full rounded-2xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="mb-6 flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-burgundy-50 to-burgundy-100/40">
          <span className="font-serif text-4xl text-burgundy-200">KM</span>
        </div>
      )}

      <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">{item.price_model ?? ''}</p>
      <h3 className="mt-2 font-serif text-2xl text-burgundy-950">{item.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-burgundy-700">{item.short_description}</p>

      {price && (
        <p className="mt-4 font-serif text-2xl text-burgundy-900">
          {currency === 'INR' ? '₹' : currency}
          {Number(price).toLocaleString('en-IN')}
        </p>
      )}

      <div className="mt-6">
        {isFixed ? (
          <Link
            to="/contact"
            className="btn-magnetic block w-full rounded-full bg-burgundy-800 px-5 py-3 text-center text-sm text-white transition hover:bg-burgundy-700"
          >
            Book now
          </Link>
        ) : (
          <Link
            to="/contact"
            className="btn-magnetic block w-full rounded-full border border-burgundy-300 px-5 py-3 text-center text-sm text-burgundy-800 transition hover:border-burgundy-500 hover:bg-burgundy-50"
          >
            Enquire
          </Link>
        )}
      </div>
    </article>
  )
}
