import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ScrollReveal } from '../components/ScrollReveal'
import { supabase } from '../lib/supabase'
import { applyImageFallback, imageFallbackSource } from '../lib/imageFallbacks'
import { EVENT_DECOR_SUBPAGES, eventDecorSubpageBySlug } from '../lib/siteConfig'
import { useCart } from '../context/CartContext'

const ALL_SLUG = 'all'

export function EventDecorSubPage() {
  const { subslug = 'birthday' } = useParams()
  const rawMeta = eventDecorSubpageBySlug(subslug)
  const meta = rawMeta ?? (subslug === ALL_SLUG ? {
    slug: 'all',
    label: 'All',
    title: 'Event & Decor',
    description: 'Celebration styling for every occasion — birthdays, anniversaries, proposals, corporate events, and special gatherings.',
    tags: [],
  } : null)
  const { addItem } = useCart()
  const [addedId, setAddedId] = useState<string | null>(null)

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Category images: one representative image per subcategory
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})

  const handleAdd = (item: any) => {
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url ?? undefined, category: item.category })
    setAddedId(item.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  useEffect(() => {
    setLoading(true)
    if (!supabase) { setLoading(false); return }
    const allSlugs = EVENT_DECOR_SUBPAGES.map((s) => s.slug)

    if (subslug === ALL_SLUG) {
      // Fetch one representative image per subcategory for the category boxes
      supabase
        .from('products')
        .select('category, image_url')
        .eq('is_active', true)
        .in('category', allSlugs)
        .then(({ data }) => {
          const images: Record<string, string> = {}
          for (const p of (data || [])) {
            if (p.image_url && !images[p.category]) {
              images[p.category] = p.image_url
            }
          }
          setCategoryImages(images)
          setLoading(false)
        })
    } else {
      const query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', subslug)
      query.then(({ data }) => {
        setItems((data || []).filter(p => p.name !== 'Homepage Settings'))
        setLoading(false)
      })
    }
  }, [subslug])

  if (!meta) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h1 className="font-serif text-5xl text-burgundy-950">Page not found</h1>
        <Link to="/services/event-and-decor" className="mt-6 inline-flex rounded-full bg-burgundy-800 px-5 py-3 text-sm text-white">
          Back to Event & Decor
        </Link>
      </section>
    )
  }

  return (
    <div className="overflow-hidden">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative border-b border-burgundy-100 bg-[radial-gradient(circle_at_top_right,_rgba(126,48,71,0.12),_transparent_50%),linear-gradient(180deg,#f7f1ee_0%,#fff_100%)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <ScrollReveal direction="up">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-burgundy-500">
              <Link to="/services/event-and-decor/all" className="underline-draw hover:text-burgundy-900">Event & Decor</Link>
              <span className="text-burgundy-300">›</span>
              <span className="text-burgundy-900 font-medium">{meta.title}</span>
            </div>

            <h1 className="mt-5 font-serif text-5xl text-burgundy-950 md:text-7xl">{meta.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-burgundy-700 md:text-lg">{meta.description}</p>

            {/* Tags */}
            {meta.tags && (
              <div className="mt-5 flex flex-wrap gap-2">
                {meta.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-burgundy-200 bg-white px-3 py-1.5 text-xs text-burgundy-600 shadow-soft">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </ScrollReveal>

          {/* Subpage tabs — now includes "All" */}
          <ScrollReveal direction="up" delay={150}>
            <div className="mt-8 flex flex-wrap gap-2">
              {/* All tab */}
              <Link
                to="/services/event-and-decor/all"
                className={`rounded-full border px-4 py-2 text-sm transition ${subslug === ALL_SLUG
                    ? 'border-burgundy-800 bg-burgundy-800 text-white shadow-[0_4px_16px_rgba(91,33,49,0.28)]'
                    : 'border-burgundy-200 bg-white text-burgundy-700 hover:border-burgundy-500 hover:text-burgundy-900'
                  }`}
              >
                All
              </Link>
              {EVENT_DECOR_SUBPAGES.map((sub) => (
                <Link
                  key={sub.slug}
                  to={`/services/event-and-decor/${sub.slug}`}
                  className={`rounded-full border px-4 py-2 text-sm transition ${sub.slug === subslug
                      ? 'border-burgundy-800 bg-burgundy-800 text-white shadow-[0_4px_16px_rgba(91,33,49,0.28)]'
                      : 'border-burgundy-200 bg-white text-burgundy-700 hover:border-burgundy-500 hover:text-burgundy-900'
                    }`}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {subslug === ALL_SLUG ? (
          /* ── Category Boxes (All view) ── */
          loading ? (
            <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-5">
              {EVENT_DECOR_SUBPAGES.map((_, i) => (
                <div key={i} className="animate-pulse rounded-[1.2rem] border border-burgundy-100 bg-white md:rounded-[1.5rem]">
                  <div className="aspect-[4/3] rounded-t-[1.2rem] bg-burgundy-50 md:rounded-t-[1.5rem]" />
                  <div className="px-3 py-3 sm:px-5 sm:py-4">
                    <div className="h-4 w-20 rounded-full bg-burgundy-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-5">
              {EVENT_DECOR_SUBPAGES.map((sub, idx) => (
                <ScrollReveal key={sub.slug} direction="up" delay={(idx % 5) * 80} className="h-full">
                  <Link
                    to={`/services/event-and-decor/${sub.slug}`}
                    className="card-lift group relative flex h-full flex-col overflow-hidden rounded-[1.2rem] border border-burgundy-100 bg-white shadow-soft md:rounded-[1.5rem]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {categoryImages[sub.slug] ? (
                        <img
                          src={categoryImages[sub.slug]}
                          alt={sub.label}
                          className="h-full w-full object-contain transition duration-700 group-hover:scale-110 bg-burgundy-50/20"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-burgundy-50/40">
                          <span className="font-serif text-2xl text-burgundy-200">{sub.label[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-1 items-center justify-between px-3 py-2.5 sm:px-5 sm:py-4">
                      <h3 className="font-serif text-sm text-burgundy-950 leading-tight sm:text-xl">{sub.label}</h3>
                      <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-burgundy-50 text-burgundy-600 text-xs transition group-hover:bg-burgundy-800 group-hover:text-white">
                        →
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )
        ) : (
          /* ── Product Cards (specific category view) ── */
          loading ? (
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
              <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
                {items.map((item) => (
                  <article key={item.id} className="card-lift flex flex-col rounded-xl border border-burgundy-100 bg-white p-2.5 shadow-soft md:rounded-[2rem] md:p-8">
                    <Link to={`/product/${item.id}`} className="relative mb-3 block overflow-hidden rounded-lg md:mb-5 md:rounded-2xl">
                      <img
                        src={item.image_url ?? item.hero_image ?? imageFallbackSource(item.id, subslug)}
                        alt={item.name}
                        className="h-28 w-full object-contain sm:h-36 md:h-52 bg-burgundy-50/10"
                        loading="lazy"
                        onError={(event) => applyImageFallback(event, imageFallbackSource(item.id, subslug))}
                      />
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-burgundy-700 backdrop-blur md:left-3 md:top-3 md:px-3 md:py-1 md:text-xs">
                        {item.category?.replace('_', ' ')}
                      </span>
                    </Link>
                    <Link to={`/product/${item.id}`} className="group-hover:opacity-80">
                      <h3 className="font-serif text-xs leading-snug text-burgundy-950 line-clamp-2 md:text-xl">{item.name}</h3>
                    </Link>
                    <p className="mt-1 flex-1 text-[11px] leading-5 text-burgundy-600 line-clamp-3 md:mt-1.5 md:text-sm md:leading-relaxed">{item.description}</p>
                    <div className="mt-3 flex flex-col gap-2 md:mt-5 md:flex-row md:items-center md:justify-end md:gap-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { service: 'Event & Decor', notes: `I would like to enquire about: ${item.name}` } }));
                        }}
                        className="rounded-full px-3 py-1.5 text-[11px] font-medium transition md:px-5 md:py-2.5 md:text-sm bg-burgundy-800 text-white hover:bg-burgundy-700"
                      >
                        Enquire Now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal direction="up">
              <div className="rounded-[2rem] border border-burgundy-100 bg-[#f7f1ee] p-12 text-center">
                <p className="font-serif text-3xl text-burgundy-900">Styling packages available on request</p>
                <p className="mt-4 text-sm leading-7 text-burgundy-700">
                  {meta.title} packages are customised to each event. Share your vision and the team will shape the experience.
                </p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { service: 'Event & Decor', notes: `I would like to start an enquiry for a ${meta.title} event.` } }))}
                  className="btn-magnetic mt-8 inline-flex rounded-full bg-burgundy-800 px-6 py-3 text-sm text-white transition hover:bg-burgundy-700"
                >
                  Start an enquiry
                </button>
              </div>
            </ScrollReveal>
          )
        )}
      </section>


    </div>
  )
}
