import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ScrollReveal } from '../components/ScrollReveal'
import { supabase } from '../lib/supabase'
import { applyImageFallback, imageFallbackSource } from '../lib/imageFallbacks'
import { EVENT_DECOR_SUBPAGES, eventDecorSubpageBySlug } from '../lib/siteConfig'

export function EventDecorSubPage() {
  const { subslug = 'birthday' } = useParams()
  const meta = eventDecorSubpageBySlug(subslug)

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (!supabase) { setLoading(false); return }
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', subslug)
      .then(({ data }) => {
        setItems(data || [])
        setLoading(false)
      })
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
              <Link to="/services/event-and-decor" className="underline-draw hover:text-burgundy-900">Event & Decor</Link>
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

          {/* Subpage tabs */}
          <ScrollReveal direction="up" delay={150}>
            <div className="mt-8 flex flex-wrap gap-2">
              {EVENT_DECOR_SUBPAGES.map((sub) => (
                <Link
                  key={sub.slug}
                  to={`/services/event-and-decor/${sub.slug}`}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    sub.slug === subslug
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

      {/* ── Items ────────────────────────────────────────────── */}
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
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="card-lift flex flex-col rounded-xl border border-burgundy-100 bg-white p-2.5 shadow-soft md:rounded-[2rem] md:p-8">
                  <img
                    src={item.image_url ?? item.hero_image ?? imageFallbackSource(item.id, subslug)}
                    alt={item.name}
                    className="mb-3 h-28 w-full rounded-lg object-cover sm:h-36 md:mb-6 md:h-48 md:rounded-2xl"
                    loading="lazy"
                    onError={(event) => applyImageFallback(event, imageFallbackSource(item.id, subslug))}
                  />
                  <h3 className="font-serif text-xs leading-snug text-burgundy-950 line-clamp-2 md:text-2xl">{item.name}</h3>
                  <p className="mt-1.5 flex-1 text-[11px] leading-5 text-burgundy-700 line-clamp-3 md:mt-3 md:text-sm md:leading-7 md:line-clamp-none">{item.description}</p>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { service: 'Event & Decor', notes: `I am interested in ${item.name} for my ${meta.title} event.` } }))}
                    className="btn-magnetic mt-3 block w-full rounded-full border border-burgundy-300 px-3 py-1.5 text-center text-[11px] text-burgundy-800 transition hover:border-burgundy-800 hover:bg-burgundy-800 hover:text-white md:mt-6 md:px-5 md:py-3 md:text-sm"
                  >
                    Enquire
                  </button>
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
        )}
      </section>


    </div>
  )
}
