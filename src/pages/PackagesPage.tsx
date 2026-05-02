import { Link } from 'react-router-dom'
import { InquiryForm } from '../components/InquiryForm'
import { ScrollReveal } from '../components/ScrollReveal'
import { packageOptions } from '../lib/data'

const packageMeta: Record<string, {
  eyebrow: string
  badge?: string
  featured?: boolean
  stats: { label: string; value: string }[]
  tags: string[]
  startingFrom?: string
  ctaLabel: string
  mood: string
}> = {
  Classic: {
    eyebrow: 'Entry Package',
    stats: [{ label: 'Ideal for', value: 'Intimate events' }, { label: 'Team support', value: 'Consultation' }],
    tags: ['Elegant', 'Intimate', 'Curated'],
    ctaLabel: 'Enquire about Classic',
    mood: 'bg-white border-burgundy-100',
  },
  Signature: {
    eyebrow: 'Most Popular',
    badge: 'Signature',
    featured: true,
    stats: [{ label: 'Ideal for', value: 'Milestone occasions' }, { label: 'Team support', value: 'Styling & Execution' }],
    tags: ['Premium', 'Visual Impact', 'Curated Detailing', 'Full Execution'],
    ctaLabel: 'Book Signature',
    mood: 'bg-[#2b1118] border-burgundy-900',
  },
  Luxury: {
    eyebrow: 'Bespoke',
    stats: [{ label: 'Ideal for', value: 'High-end events' }, { label: 'Team support', value: 'Priority & Personalised' }],
    tags: ['Bespoke', 'Luxury Decor', 'Priority Access', 'Immersive Design'],
    ctaLabel: 'Request Luxury Package',
    mood: 'bg-white border-burgundy-100',
  },
}

export function PackagesPage() {
  return (
    <div className="overflow-hidden">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative border-b border-burgundy-100 bg-[radial-gradient(ellipse_at_top_right,_rgba(126,48,71,0.14),_transparent_55%),linear-gradient(180deg,#f7f1ee_0%,#fff_100%)] overflow-hidden">
        {/* Decorative grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <ScrollReveal direction="up">
            <p className="text-xs uppercase tracking-[0.4em] text-burgundy-500">Packages</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.1] text-burgundy-950 md:text-7xl">
              Choose a direction.<br />
              <em className="text-shimmer not-italic">The team handles the rest.</em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-burgundy-700">
              Each package is a premium starting point — select the level that fits your vision, share the event basics, and let Keepsake Moments shape every detail from there.
            </p>
          </ScrollReveal>

          {/* Stats row */}
          <ScrollReveal direction="up" delay={180}>
            <div className="mt-10 flex flex-wrap gap-8 border-t border-burgundy-100 pt-8">
              {[
                { value: '3', label: 'Curated Packages' },
                { value: '100%', label: 'Personalised Execution' },
                { value: '4', label: 'Service Categories' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-4xl text-burgundy-900 count-stat">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-burgundy-500">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <ScrollReveal direction="scale">
        <div className="divider-grow mx-auto max-w-7xl px-4 md:px-8" />
      </ScrollReveal>

      {/* ── Package Cards ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <ScrollReveal direction="up" className="mb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-burgundy-400">Explore packages</p>
          <h2 className="mt-2 font-serif text-4xl text-burgundy-950">Three distinct tiers. One seamless experience.</h2>
        </ScrollReveal>

        <ScrollReveal stagger>
          <div className="grid gap-6 md:grid-cols-3">
            {packageOptions.map((option) => {
              const meta = packageMeta[option.name]
              const isFeatured = meta?.featured
              return (
                <article
                  key={option.name}
                  className={`card-lift relative flex flex-col overflow-hidden rounded-[2rem] border p-8 shadow-soft ${
                    isFeatured
                      ? 'bg-[#2b1118] border-burgundy-900 text-[#f7f1ee] md:-translate-y-3 md:scale-[1.03] shadow-[0_32px_80px_rgba(43,17,24,0.45)]'
                      : 'bg-white border-burgundy-100'
                  }`}
                >
                  {/* Featured badge */}
                  {isFeatured && (
                    <span className="absolute right-6 top-6 rounded-full bg-[#b08c5a] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#2b1118] font-medium">
                      Most Popular
                    </span>
                  )}

                  {/* Eyebrow */}
                  <p className={`text-[10px] uppercase tracking-[0.35em] ${
                    isFeatured ? 'text-[#b08c5a]' : 'text-burgundy-500'
                  }`}>{meta?.eyebrow}</p>

                  {/* Title */}
                  <h3 className={`mt-2 font-serif text-4xl ${
                    isFeatured ? 'text-[#f7f1ee]' : 'text-burgundy-950'
                  }`}>{option.name}</h3>

                  {/* Description */}
                  <p className={`mt-4 text-sm leading-7 ${
                    isFeatured ? 'text-[#c9b8b0]' : 'text-burgundy-700'
                  }`}>{option.description}</p>

                  {/* Divider */}
                  <div className={`my-5 h-px ${
                    isFeatured ? 'bg-[rgba(247,241,238,0.1)]' : 'bg-burgundy-50'
                  }`} />

                  {/* Includes list */}
                  <ul className="space-y-2.5 flex-1">
                    {option.includes.map((item) => (
                      <li key={item} className={`flex items-start gap-2.5 text-sm ${
                        isFeatured ? 'text-[#e3d7d0]' : 'text-burgundy-700'
                      }`}>
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${
                          isFeatured ? 'bg-[rgba(247,241,238,0.12)] text-[#b08c5a]' : 'bg-burgundy-50 text-burgundy-500'
                        }`}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Tags / Chips */}
                  {meta?.tags && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {meta.tags.map((tag) => (
                        <span key={tag} className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] ${
                          isFeatured
                            ? 'bg-[rgba(247,241,238,0.08)] text-[#c9b8b0] border border-[rgba(247,241,238,0.1)]'
                            : 'bg-burgundy-50 text-burgundy-500 border border-burgundy-100'
                        }`}>{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  {meta?.stats && (
                    <div className={`mt-5 grid grid-cols-2 gap-3 rounded-2xl p-3 text-xs ${
                      isFeatured ? 'bg-[rgba(247,241,238,0.05)]' : 'bg-burgundy-50/60'
                    }`}>
                      {meta.stats.map((s) => (
                        <div key={s.label}>
                          <p className={isFeatured ? 'text-[#b08c5a]' : 'text-burgundy-400'}>{s.label}</p>
                          <p className={`mt-0.5 font-medium ${
                            isFeatured ? 'text-[#f7f1ee]' : 'text-burgundy-800'
                          }`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    to="/contact"
                    className={`btn-magnetic mt-6 block rounded-full px-6 py-3.5 text-center text-sm font-medium transition ${
                      isFeatured
                        ? 'bg-[#b08c5a] text-[#2b1118] hover:bg-[#c9a070]'
                        : 'border border-burgundy-300 text-burgundy-800 hover:bg-burgundy-800 hover:text-white hover:border-burgundy-800'
                    }`}
                  >
                    {meta?.ctaLabel ?? 'Enquire'}
                  </Link>
                </article>
              )
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Discovery / editorial strip ───────────────────────── */}
      <section className="relative overflow-hidden bg-[#2b1118] py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal direction="up">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#b08c5a]">How it works</p>
                <h2 className="mt-3 font-serif text-4xl text-[#f7f1ee] md:text-5xl">
                  Share the vision.<br />We refine the details.
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-7 text-[#c9b8b0]">
                  Packages are a starting point for the conversation. Once you select a tier and submit your enquiry, the team reaches out personally to align on pricing, scope, styling, and execution. No guesswork — just clarity.
                </p>
                <div className="mt-8 flex flex-wrap gap-6">
                  {[
                    { step: '01', label: 'Choose a package' },
                    { step: '02', label: 'Share event details' },
                    { step: '03', label: 'Team follows up' },
                    { step: '04', label: 'Execution begins' },
                  ].map(({ step, label }) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="font-serif text-2xl text-[#b08c5a]">{step}</span>
                      <span className="text-xs text-[#c9b8b0] uppercase tracking-[0.2em]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  to="/contact"
                  className="btn-magnetic whitespace-nowrap rounded-full bg-[#b08c5a] px-8 py-4 text-sm font-medium text-[#2b1118] transition hover:bg-[#c9a070]"
                >
                  Start your enquiry
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Enquiry Form ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <ScrollReveal direction="up">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">Package enquiry</p>
              <h2 className="mt-3 font-serif text-4xl text-burgundy-950">Ready to begin?</h2>
              <p className="mt-4 text-sm leading-7 text-burgundy-700">
                You do not need to finalise every detail here. Share the basics — package preference, occasion, and timeline — and the team will shape the rest personally.
              </p>
              <div className="mt-8 rounded-2xl border border-burgundy-100 bg-burgundy-50/50 p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-burgundy-500">What to include</p>
                <ul className="mt-3 space-y-2 text-sm text-burgundy-700">
                  {['Preferred package tier', 'Event date or rough timeline', 'Occasion type', 'Guest count if known'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-burgundy-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <InquiryForm compact />
          </div>
        </ScrollReveal>
      </section>

    </div>
  )
}
