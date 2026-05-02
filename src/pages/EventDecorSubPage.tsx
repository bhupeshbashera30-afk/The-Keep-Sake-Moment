import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { InquiryForm } from '../components/InquiryForm'
import { ScrollReveal } from '../components/ScrollReveal'
import { supabase, type ServiceRecord } from '../lib/supabase'

const subpageMeta: Record<string, { title: string; description: string; categoryNote: string; tags: string[] }> = {
  birthday: {
    title: 'Birthday Décor',
    description:
      'Bespoke birthday setups designed around your vision — from intimate dining to full celebration styling. Every detail shaped to the occasion.',
    categoryNote: 'birthday',
    tags: ['Balloons & Florals', 'Themed Setups', 'Custom Backdrops', 'Cake Tables'],
  },
  anniversary: {
    title: 'Anniversary Styling',
    description:
      'Romantic, editorial anniversary setups that honour milestones with elegance and warmth. Custom to every couple.',
    categoryNote: 'anniversary',
    tags: ['Romantic Lighting', 'Floral Arches', 'Table Styling', 'Custom Signage'],
  },
  proposal: {
    title: 'Proposal Concepts',
    description:
      'Intimate, one-of-a-kind proposal setups crafted around the story of the two of you. The team handles every detail.',
    categoryNote: 'proposal',
    tags: ['Petal Pathways', 'Candle Setups', 'Floral Tunnels', 'Personalised Touches'],
  },
  corporate: {
    title: 'Corporate Events',
    description:
      'Premium brand-led event styling for corporate occasions — launches, celebrations, and team events with a refined editorial finish.',
    categoryNote: 'corporate',
    tags: ['Brand-Aligned Decor', 'Stage Styling', 'Branded Installations', 'Table Settings'],
  },
  'special-occasion': {
    title: 'Special Occasions',
    description:
      'Designed for moments that do not fit a standard category. Whatever the occasion, the team will shape an experience worth keeping.',
    categoryNote: 'special occasion',
    tags: ['Fully Custom', 'Any Occasion', 'Any Scale', 'Any Vision'],
  },
}

const decorSubpages = [
  { slug: 'birthday', label: 'Birthday' },
  { slug: 'anniversary', label: 'Anniversary' },
  { slug: 'proposal', label: 'Proposal' },
  { slug: 'corporate', label: 'Corporate Event' },
  { slug: 'special-occasion', label: 'Special Occasion' },
]

export function EventDecorSubPage() {
  const { subslug = 'birthday' } = useParams()
  const meta = subpageMeta[subslug]

  const [items, setItems] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (!supabase) { setLoading(false); return }
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq('category_id', 4)
      .ilike('name', `%${meta?.categoryNote ?? subslug}%`)
      .order('sort_order')
      .then(({ data }) => {
        setItems((data as ServiceRecord[]) ?? [])
        setLoading(false)
      })
  }, [subslug, meta])

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
              {decorSubpages.map((sub) => (
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="card-lift flex flex-col rounded-[2rem] border border-burgundy-100 bg-white p-8 shadow-soft">
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
                  <h3 className="font-serif text-2xl text-burgundy-950">{item.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-burgundy-700">{item.short_description}</p>
                  <Link
                    to="/contact"
                    className="btn-magnetic mt-6 block rounded-full border border-burgundy-300 px-5 py-3 text-center text-sm text-burgundy-800 transition hover:border-burgundy-800 hover:bg-burgundy-800 hover:text-white"
                  >
                    Enquire
                  </Link>
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
              <Link
                to="/contact"
                className="btn-magnetic mt-8 inline-flex rounded-full bg-burgundy-800 px-6 py-3 text-sm text-white transition hover:bg-burgundy-700"
              >
                Start an enquiry
              </Link>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* ── Enquiry ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <ScrollReveal direction="up">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-burgundy-400">Enquiry</p>
              <h2 className="mt-3 font-serif text-4xl text-burgundy-950">Tell us about the occasion.</h2>
              <p className="mt-4 text-sm leading-7 text-burgundy-700">
                Share the basics — the team will follow up to refine the styling, scope, and execution details personally.
              </p>
            </div>
            <InquiryForm compact />
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}
