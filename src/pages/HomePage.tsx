import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Gift, Moon, PartyPopper, HeartHandshake, Star, Clock, Award } from 'lucide-react'
import { InquiryForm } from '../components/InquiryForm'
import { SectionIntro } from '../components/SectionIntro'
import { ScrollReveal } from '../components/ScrollReveal'
import { marqueeItems, packageOptions } from '../lib/data'

const highlights = [
  {
    icon: Camera,
    title: 'Photobooth Rental',
    body: 'Elegant booth styling and guest-friendly experiences for social and brand-led events.',
    link: '/services/photobooth-rental',
    tooltip: 'Open-air & enclosed setups · Custom props · Digital delivery',
    stat: '200+',
    statLabel: 'events',
  },
  {
    icon: Gift,
    title: 'Hampers & Flower',
    body: 'Luxury gifting collections with flowers, curated pairings, and ready-price selections.',
    link: '/services/hampers-and-flower',
    tooltip: 'Same-day dispatch · Custom ribbons · Bespoke curation',
    stat: '500+',
    statLabel: 'hampers',
  },
  {
    icon: Moon,
    title: 'Dinner Night',
    body: 'Romantic and intimate dinner experiences styled around mood, detail, and atmosphere.',
    link: '/services/dinner-night',
    tooltip: 'Candle setups · Floral table decor · Private dining',
    stat: '150+',
    statLabel: 'dinners',
  },
  {
    icon: PartyPopper,
    title: 'Event & Decor',
    body: 'Birthday, anniversary, proposal, and corporate styling with an editorial sensibility.',
    link: '/services/event-and-decor',
    tooltip: 'Birthdays · Proposals · Corporate · Anniversaries',
    stat: '300+',
    statLabel: 'setups',
  },
]

const stats = [
  { icon: Star, value: 150, suffix: '+', label: 'Premium clients' },
  { icon: Clock, value: 4, suffix: ' yrs', label: 'Crafting moments' },
  { icon: Award, value: 98, suffix: '%', label: 'Client satisfaction' },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const duration = 1800
        const step = (timestamp: number) => {
          if (!start) start = timestamp
          const pct = Math.min((timestamp - start) / duration, 1)
          const ease = 1 - Math.pow(1 - pct, 3)
          setCount(Math.floor(ease * target))
          if (pct < 1) requestAnimationFrame(step)
          else setCount(target)
        }
        requestAnimationFrame(step)
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref} className="count-stat">{count}{suffix}</span>
}

export function HomePage() {
  const heroTextRef = useRef<HTMLHeadingElement>(null)

  // Parallax on hero headline
  useEffect(() => {
    const handle = () => {
      if (!heroTextRef.current) return
      const y = window.scrollY * 0.18
      heroTextRef.current.style.transform = `translateY(${y}px)`
    }
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-burgundy-100 bg-[radial-gradient(circle_at_top,_rgba(126,48,71,0.18),_transparent_40%),linear-gradient(180deg,#f7f1ee_0%,#fff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

            {/* Left */}
            <div>
              <ScrollReveal direction="up" delay={100}>
                <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">Premium event and gifting studio</p>
              </ScrollReveal>

              <h1
                ref={heroTextRef}
                className="parallax-text mt-6 max-w-4xl font-serif text-6xl leading-[0.92] text-burgundy-950 md:text-8xl"
                style={{ opacity: 1 }}
              >
                <span className="block overflow-hidden">
                  <span className="block animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                    Curated
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span className="block animate-fade-up" style={{ animationDelay: '0.28s', animationFillMode: 'both' }}>
                    moments
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span className="block animate-fade-up italic text-burgundy-700" style={{ animationDelay: '0.41s', animationFillMode: 'both' }}>
                    designed to last.
                  </span>
                </span>
              </h1>

              <ScrollReveal direction="up" delay={300}>
                <p className="mt-6 max-w-2xl text-base leading-8 text-burgundy-700 md:text-lg">
                  Keepsake Moments creates intimate celebrations, luxury hampers, photobooth installations,
                  dinner nights, and custom decor stories for modern clients who want every detail to feel memorable.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={420}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    to="/contact"
                    className="btn-magnetic rounded-full bg-burgundy-800 px-6 py-3 text-sm text-white hover:bg-burgundy-700"
                  >
                    Start your enquiry
                  </Link>
                  <Link
                    to="/packages"
                    className="btn-magnetic rounded-full border border-burgundy-300 px-6 py-3 text-sm text-burgundy-800 hover:border-burgundy-500"
                  >
                    Explore packages
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* Right — brand mood block */}
            <ScrollReveal direction="right" delay={200}>
              <div className="relative">
                <div className="overflow-hidden rounded-[2.5rem] bg-burgundy-900 p-10 text-white shadow-glow">
                  <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-burgundy-700 opacity-30 blur-2xl animate-float" />
                  <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-burgundy-600 opacity-20 blur-xl animate-float" style={{ animationDelay: '2s' }} />
                  <p className="relative text-xs uppercase tracking-[0.4em] text-white/50">Our story</p>
                  <p className="relative mt-5 font-serif text-4xl leading-snug text-white">
                    Every occasion deserves to feel
                    <span className="block italic text-white/70"> deeply considered.</span>
                  </p>
                  <p className="relative mt-5 text-sm leading-7 text-white/70">
                    We believe celebrations should carry real feeling — not just decoration.
                    Every setup, every hamper, every detail is shaped around the story
                    you want to tell and the memory you want to keep.
                  </p>
                  <div className="relative mt-8 flex flex-wrap gap-2">
                    {['Photobooth', 'Hampers', 'Dinner Night', 'Décor'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-white/50 hover:text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* ── Marquee ─────────────────────────────────────── */}
        <div className="border-y border-burgundy-100 bg-white/60 py-4">
          <div className="marquee-track">
            <div className="marquee-inner">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="font-serif text-3xl text-burgundy-800 md:text-5xl select-none"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="border-b border-burgundy-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal stagger>
            <div className="grid grid-cols-3 divide-x divide-burgundy-100">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center py-10 px-4 text-center">
                  <s.icon className="h-5 w-5 text-gold mb-4" />
                  <p className="font-serif text-4xl text-burgundy-950 md:text-5xl">
                    <CountUp target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-burgundy-500">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <ScrollReveal direction="up">
          <SectionIntro
            eyebrow="Services"
            title="A collection of experiences, not just offerings."
            description="Each service is crafted around a different kind of moment — from intimate gifting to full event styling."
          />
        </ScrollReveal>

        <ScrollReveal stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.title} className="tooltip-host">
              <Link
                to={item.link}
                className="card-lift group flex flex-col rounded-[2rem] border border-burgundy-100 bg-white p-8 shadow-soft"
              >
                <item.icon className="h-7 w-7 text-burgundy-700 transition group-hover:scale-110 duration-300" />
                <h3 className="mt-6 font-serif text-2xl text-burgundy-950">{item.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-burgundy-700">{item.body}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-serif text-2xl text-gold count-stat">{item.stat}</span>
                  <span className="text-xs text-burgundy-400">{item.statLabel}</span>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-burgundy-600 transition group-hover:text-burgundy-900 underline-draw">
                  Discover →
                </span>
              </Link>
              <div className="tooltip-bubble">{item.tooltip}</div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* ── Packages ────────────────────────────────────────── */}
      <section className="bg-white/70 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <ScrollReveal direction="left">
              <div>
                <SectionIntro
                  eyebrow="Packages"
                  title="Structured packages with room for bespoke refinement."
                  description="Browse a package direction, submit the service you want, and the team personalises the details from there."
                />
                <Link
                  to="/packages"
                  className="btn-magnetic mt-8 inline-flex rounded-full bg-burgundy-800 px-6 py-3 text-sm text-white hover:bg-burgundy-700"
                >
                  View all packages
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal stagger className="grid gap-5">
              {packageOptions.map((option) => (
                <article
                  key={option.name}
                  className="card-lift rounded-[2rem] border border-burgundy-100 bg-parchment p-6 cursor-default"
                >
                  <h3 className="font-serif text-2xl text-burgundy-900">{option.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-burgundy-700">{option.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.includes.map((item) => (
                      <span key={item} className="rounded-full border border-burgundy-200 bg-white px-3 py-1 text-xs text-burgundy-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Enquiry ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <ScrollReveal direction="left">
            <div>
              <SectionIntro
                eyebrow="Enquiry"
                title="Tell the team what you are planning."
                description="The booking form captures the basics so the team can respond with a tailored proposal."
              />
              <div className="mt-8 rounded-[2rem] border border-burgundy-100 bg-burgundy-900 p-8 text-white">
                <HeartHandshake className="h-8 w-8 text-white/60" />
                <p className="mt-5 font-serif text-3xl">A premium consultation-led workflow</p>
                <p className="mt-4 text-sm leading-7 text-white/80">
                  Fixed-price sections can still lead to enquiry, while custom work stays flexible and personal
                  from the first conversation onward.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={150}>
            <InquiryForm />
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
