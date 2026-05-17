import { ScrollReveal } from '../components/ScrollReveal'

const values = [
  { icon: '◇', label: 'Editorial Eye', text: 'Every setup is art-directed — mood, palette, and texture work together as a complete visual statement.' },
  { icon: '◈', label: 'Detail-First', text: 'No element is an afterthought. From table placement to petal selection, the craft is in the details.' },
  { icon: '◉', label: 'Personal Process', text: 'The team consults directly with every client so the final experience is shaped around their vision, not a template.' },
  { icon: '◫', label: 'Soft Luxury', text: 'Graceful restraint over excess. The aesthetic is modern, warm, and rooted in tactile refinement.' },
]

const milestones = [
  { year: '2021', event: 'Brand founded with a focus on intimate events and gifting.' },
  { year: '2022', event: 'Expanded into Event & Decor with full-team styling capability.' },
  { year: '2023', event: 'Photobooth Rental and Dinner Night collections introduced.' },
  { year: '2024', event: 'Signature Luxury package tier launched for milestone occasions.' },
]

export function AboutPage() {
  return (
    <div className="overflow-hidden">

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative border-b border-burgundy-100 bg-[radial-gradient(ellipse_at_top_right,_rgba(126,48,71,0.12),_transparent_55%),linear-gradient(180deg,#f7f1ee_0%,#fff_100%)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <ScrollReveal direction="up">
            <p className="text-xs uppercase tracking-[0.4em] text-burgundy-500">About</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.12] text-burgundy-950 md:text-7xl">
              An elegant studio<br />
              <em className="not-italic text-shimmer">for thoughtful celebrations.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-burgundy-700">
              Keepsake Moments is a premium event and gifting brand rooted in editorial styling, soft luxury, and detail-driven presentation. Every project is shaped as a complete visual mood — not a simple order.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Story blocks ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <ScrollReveal stagger>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="card-lift rounded-[2rem] border border-burgundy-100 bg-white p-8 shadow-soft">
              <p className="text-[10px] uppercase tracking-[0.35em] text-burgundy-400">What we create</p>
              <h3 className="mt-3 font-serif text-3xl text-burgundy-950">Visual moods, not just setups.</h3>
              <p className="mt-4 text-sm leading-7 text-burgundy-700">
                From photobooth installations and romantic dinner-night concepts to gifting, florals, and celebratory décor, each project is shaped as a complete visual mood rather than a simple order request.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Photobooth Rental', 'Dinner Night', 'Hampers & Flowers', 'Event & Decor'].map((s) => (
                  <span key={s} className="rounded-full border border-burgundy-100 bg-burgundy-50 px-3 py-1 text-xs text-burgundy-600">{s}</span>
                ))}
              </div>
            </article>

            <article className="card-lift rounded-[2rem] border border-burgundy-100 bg-white p-8 shadow-soft">
              <p className="text-[10px] uppercase tracking-[0.35em] text-burgundy-400">How it works</p>
              <h3 className="mt-3 font-serif text-3xl text-burgundy-950">Consultative, not transactional.</h3>
              <p className="mt-4 text-sm leading-7 text-burgundy-700">
                Clients explore the available services, submit a concise enquiry, and the team follows up directly to align on pricing, styling direction, logistics, and event requirements.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[['01 Explore', 'Browse services'], ['02 Enquire', 'Submit the essentials'], ['03 Consult', 'Team aligns with you'], ['04 Execute', 'Flawless delivery']].map(([step, desc]) => (
                  <div key={step} className="rounded-xl bg-burgundy-50/60 p-3">
                    <p className="font-serif text-sm text-burgundy-800">{step}</p>
                    <p className="mt-0.5 text-xs text-burgundy-500">{desc}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <ScrollReveal direction="scale">
        <div className="divider-grow mx-auto max-w-7xl px-4 md:px-8" />
      </ScrollReveal>

      {/* ── Brand values ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <ScrollReveal direction="up" className="mb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-burgundy-400">Our values</p>
          <h2 className="mt-2 font-serif text-4xl text-burgundy-950">The principles behind every piece.</h2>
        </ScrollReveal>

        <ScrollReveal stagger>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <article key={v.label} className="card-lift rounded-2xl border border-burgundy-100 bg-white p-6 shadow-soft">
                <span className="font-serif text-3xl text-burgundy-300">{v.icon}</span>
                <h4 className="mt-3 font-serif text-xl text-burgundy-950">{v.label}</h4>
                <p className="mt-2 text-sm leading-6 text-burgundy-600">{v.text}</p>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Editorial quote block ─────────────────────────────── */}
      <ScrollReveal direction="up">
        <section className="relative overflow-hidden bg-[#2b1118] py-20">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
          <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
            <p className="font-serif text-3xl italic leading-relaxed text-[#f7f1ee] md:text-4xl">
              &ldquo;Designed for clients who want more than a standard setup — for those who see their celebration as a moment worth keeping.&rdquo;
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#b08c5a]">Keepsake Moments</p>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Timeline ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <ScrollReveal direction="up" className="mb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-burgundy-400">The journey</p>
          <h2 className="mt-2 font-serif text-4xl text-burgundy-950">A brand built over time.</h2>
        </ScrollReveal>

        <ScrollReveal stagger>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={m.year} className={`flex gap-6 border-l-2 border-burgundy-100 py-6 pl-6 ${
                i === milestones.length - 1 ? '' : ''
              }`}>
                <div className="-ml-[2.5rem] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-burgundy-200 bg-white">
                  <span className="h-2 w-2 rounded-full bg-burgundy-500" />
                </div>
                <div>
                  <p className="font-serif text-sm text-burgundy-500">{m.year}</p>
                  <p className="mt-1 text-sm leading-6 text-burgundy-800">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

    </div>
  )
}
