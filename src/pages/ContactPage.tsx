import { InquiryForm } from '../components/InquiryForm'
import { ScrollReveal } from '../components/ScrollReveal'

export function ContactPage() {
  return (
    <div className="overflow-hidden">

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative border-b border-burgundy-100 bg-[radial-gradient(ellipse_at_top_right,_rgba(126,48,71,0.12),_transparent_55%),linear-gradient(180deg,#f7f1ee_0%,#fff_100%)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <ScrollReveal direction="up">
            <p className="text-xs uppercase tracking-[0.4em] text-burgundy-500">Contact</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.12] text-burgundy-950 md:text-7xl">
              Start with<br />
              <em className="not-italic text-shimmer">what you already know.</em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-burgundy-700">
              Whether you are booking a ready-priced hamper or planning a custom proposal setup, share the basics and the team will shape the next steps personally.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Form + Meta ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <ScrollReveal direction="up">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">

            {/* Left: meta */}
            <div className="space-y-6">
              {/* Response style card */}
              <div className="card-lift rounded-[2rem] border border-burgundy-100 bg-white p-8 shadow-soft">
                <p className="text-[10px] uppercase tracking-[0.35em] text-burgundy-500">Response style</p>
                <p className="mt-4 font-serif text-xl text-burgundy-950">Elegant, consultative, and personal.</p>
                <p className="mt-3 text-sm leading-7 text-burgundy-700">
                  The form collects the essentials so the conversation can stay focused on vision and execution — no long questionnaires, no friction.
                </p>
              </div>

              {/* What to include */}
              <div className="rounded-2xl border border-burgundy-100 bg-burgundy-50/50 p-6">
                <p className="text-[10px] uppercase tracking-[0.35em] text-burgundy-400">What to include</p>
                <ul className="mt-4 space-y-3">
                  {[
                    ['Event type', 'Birthday, anniversary, proposal, corporate…'],
                    ['Preferred date', 'Approximate is fine'],
                    ['Guest count', 'Rough estimate welcome'],
                    ['Style direction', 'Intimate, grand, romantic, editorial…'],
                  ].map(([title, desc]) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy-400" />
                      <div>
                        <p className="text-xs font-medium text-burgundy-800">{title}</p>
                        <p className="text-xs text-burgundy-500">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {['Fast response', 'Personalised', 'No commitment needed', 'Consultative'].map((tag) => (
                  <span key={tag} className="rounded-full border border-burgundy-100 bg-white px-3 py-1 text-xs text-burgundy-600 shadow-soft">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <InquiryForm submissionType="contact" />
          </div>
        </ScrollReveal>
      </section>

    </div>
  )
}
