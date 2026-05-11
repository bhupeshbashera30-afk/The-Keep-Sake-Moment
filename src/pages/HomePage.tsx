import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Gift, Moon, PartyPopper, HeartHandshake, Star, Clock, Award, IceCream, Flower2, ShoppingBag, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { InquiryForm } from '../components/InquiryForm'
import { SectionIntro } from '../components/SectionIntro'
import { ScrollReveal } from '../components/ScrollReveal'
import { marqueeItems } from '../lib/data'
import { useProducts, type Product } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'

/* ── Hero Slides — rotating service images ────────────────── */
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop',
    occasion: 'Photobooth Rental',
    tagline: 'Capture every moment',
  },
  {
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=1200&auto=format&fit=crop',
    occasion: 'Hampers & Flowers',
    tagline: 'Gifts worth keeping',
  },
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop',
    occasion: 'Dinner Nights',
    tagline: 'Intimate moments, curated',
  },
  {
    image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=1200&auto=format&fit=crop',
    occasion: 'Event & Decor',
    tagline: 'Every detail, designed',
  },
  {
    image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=1200&auto=format&fit=crop',
    occasion: 'Ice Cream Rental',
    tagline: 'Sweetness on demand',
  },
]

/* ── Right-side quick links ───────────────────────────────── */
const heroQuickLinks = [
  { label: 'Photobooth', to: '/services/photobooth-rental', icon: Camera },
  { label: 'Flowers & Hampers', to: '/services/hampers-and-flower', icon: Gift },
  { label: 'Ice Cream Rental', to: '/services/ice-cream-rental', icon: IceCream },
  { label: 'Dinner Nights', to: '/services/dinner-night', icon: HeartHandshake },
]

/* ── Category Cards ───────────────────────────────────────── */
const categories = [
  {
    name: 'Flower Bouquet',
    slug: '/services/hampers-and-flower',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=600&auto=format&fit=crop',
    color: 'from-rose-100 to-pink-50',
  },
  {
    name: 'Hampers',
    slug: '/services/hampers-and-flower',
    image: '/images/hampers-category.png',
    color: 'from-amber-100 to-orange-50',
  },
  {
    name: 'Photobooth Rental',
    slug: '/services/photobooth-rental',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600&auto=format&fit=crop',
    color: 'from-purple-100 to-violet-50',
  },
  {
    name: 'Event & Decor',
    slug: '/services/event-and-decor',
    image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=600&auto=format&fit=crop',
    color: 'from-emerald-100 to-green-50',
  },

  {
    name: 'Ice Cream Rental',
    slug: '/services/ice-cream-rental',
    image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=600&auto=format&fit=crop',
    color: 'from-pink-100 to-rose-50',
  },
  {
    name: 'Dinner Date',
    slug: '/services/dinner-night',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600&auto=format&fit=crop',
    color: 'from-burgundy-100 to-rose-50',
  },
]

/* ── Testimonials ─────────────────────────────────────────── */
const testimonials = [
  {
    name: 'Priya Sharma',
    event: 'Birthday Celebration',
    text: 'Keepsake Moments turned my 30th birthday into something straight out of a magazine. Every detail was perfect — from the balloon setup to the cake table styling.',
    rating: 5,
  },
  {
    name: 'Rohan & Ananya',
    event: 'Anniversary Dinner',
    text: 'The dinner night setup was breathtaking. The candles, the flowers, the mood lighting — it felt like a private restaurant just for us. Truly unforgettable.',
    rating: 5,
  },
  {
    name: 'Meera Kapoor',
    event: 'Corporate Event',
    text: 'Professional, creative, and so easy to work with. Our corporate gala looked absolutely stunning. The photobooth was a massive hit with everyone!',
    rating: 5,
  },
  {
    name: 'Vikram Patel',
    event: 'Proposal Setup',
    text: 'I wanted the proposal to be perfect and Keepsake Moments delivered beyond my wildest expectations. She said yes in the most beautiful setting imaginable.',
    rating: 5,
  },
]

/* ── Stats ────────────────────────────────────────────────── */
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
  /* ── Hero slideshow state ────────────────────────────────── */
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const startSlideTimer = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current)
    slideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
  }, [])

  useEffect(() => {
    startSlideTimer()
    return () => { if (slideTimer.current) clearInterval(slideTimer.current) }
  }, [startSlideTimer])

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx)
    startSlideTimer()
  }
  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)
  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length)

  /* ── Quick grabs products ───────────────────────────────── */
  const { products, loading: productsLoading } = useProducts()
  const { addItem } = useCart()
  const [addedId, setAddedId] = useState<string | null>(null)
  const quickGrabs = products.slice(0, 6)

  const handleAdd = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url ?? undefined, category: product.category })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <div>
      {/* ── Hero with Image Carousel + Service Links ────────── */}
      <section className="relative overflow-hidden bg-[#faf6f3]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-stretch" style={{ minHeight: '600px' }}>

            {/* Left — Image Carousel */}
            <div className="relative overflow-hidden rounded-[2rem] shadow-glow">
              {heroSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                  style={{ opacity: idx === currentSlide ? 1 : 0 }}
                >
                  <img
                    src={slide.image}
                    alt={slide.occasion}
                    className="h-full w-full object-cover"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
              ))}

              {/* Slide content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    {heroSlides[currentSlide].occasion}
                  </p>
                  <h1 className="mt-2 font-serif text-4xl text-white md:text-6xl lg:text-7xl">
                    {heroSlides[currentSlide].tagline}
                  </h1>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry'))}
                      className="btn-magnetic rounded-full bg-white px-6 py-3 text-sm font-medium text-burgundy-900 hover:bg-burgundy-50"
                    >
                      Start your enquiry
                    </button>
                    <Link
                      to="/packages"
                      className="btn-magnetic rounded-full border border-white/40 px-6 py-3 text-sm text-white hover:border-white hover:bg-white/10"
                    >
                      Explore packages
                    </Link>
                  </div>
                </div>

                {/* Slide controls */}
                <div className="mt-6 flex items-center gap-3">
                  <button onClick={prevSlide} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30" aria-label="Previous slide">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex gap-2">
                    {heroSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx === currentSlide ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button onClick={nextSlide} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30" aria-label="Next slide">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right — Service Quick Links */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.35em] text-burgundy-500 mb-1">Services</p>
              {heroQuickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="card-lift group flex items-center gap-4 rounded-2xl border border-burgundy-100 bg-white px-5 py-5 shadow-soft transition hover:border-burgundy-300"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-burgundy-50 text-burgundy-700 transition group-hover:bg-burgundy-100 group-hover:scale-110">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-burgundy-900">{link.label}</p>
                    <p className="text-xs text-burgundy-500">Explore →</p>
                  </div>
                </Link>
              ))}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry'))}
                className="btn-magnetic mt-auto rounded-2xl bg-burgundy-800 px-5 py-4 text-sm font-medium text-white transition hover:bg-burgundy-700"
              >
                Enquire now
              </button>
            </div>
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
          <div className="grid grid-cols-3 divide-x divide-burgundy-100">
            {stats.map((s, idx) => (
              <ScrollReveal key={s.label} direction="up" delay={idx * 100} className="h-full">
                <div className="flex h-full flex-col items-center py-10 px-4 text-center">
                  <s.icon className="h-5 w-5 text-gold mb-4" />
                  <p className="font-serif text-4xl text-burgundy-950 md:text-5xl">
                    <CountUp target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-burgundy-500">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Grid ─────────────────────────────────── */}
      <section className="bg-[#faf6f3] py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal direction="up">
            <SectionIntro
              eyebrow="Categories"
              title="Explore what we offer."
              description="From romantic dinner setups to photo booth rentals — find the perfect experience or gift for every occasion."
            />
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat, idx) => (
              <ScrollReveal key={cat.name} direction="up" delay={(idx % 4) * 80} className="h-full">
                <Link
                  to={cat.slug}
                  className="card-lift group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-burgundy-100 bg-white shadow-soft"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 items-center justify-between px-5 py-4">
                    <h3 className="font-serif text-xl text-burgundy-950">{cat.name}</h3>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy-50 text-burgundy-600 transition group-hover:bg-burgundy-800 group-hover:text-white">
                      →
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="bg-white py-20 border-y border-burgundy-100">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal direction="up">
            <SectionIntro
              eyebrow="Testimonials"
              title="What our clients say."
              description="Every review is a story of trust, care, and moments made unforgettable."
            />
          </ScrollReveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, idx) => (
              <ScrollReveal key={t.name} direction="up" delay={(idx % 4) * 100} className="h-full">
                <article className="card-lift flex h-full flex-col rounded-[1.5rem] border border-burgundy-100 bg-parchment p-6 shadow-soft">
                  <Quote className="h-7 w-7 text-burgundy-200 mb-3" />
                  <p className="flex-1 text-sm leading-7 text-burgundy-700 italic">
                    "{t.text}"
                  </p>
                  <div className="mt-5 border-t border-burgundy-100 pt-4">
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="font-serif text-lg text-burgundy-950">{t.name}</p>
                    <p className="text-xs text-burgundy-500 uppercase tracking-[0.2em]">{t.event}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Grabs / Add to Cart ─────────────────────── */}
      <section className="bg-[#faf6f3] py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal direction="up">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <SectionIntro
                eyebrow="Quick Grabs"
                title="Add to cart — ready to gift."
                description="Browse our curated collection of ready-to-order hampers, flowers, and celebration essentials."
              />
              <Link
                to="/shop"
                className="btn-magnetic mb-2 rounded-full border border-burgundy-300 px-5 py-2.5 text-sm text-burgundy-800 transition hover:bg-burgundy-800 hover:text-white hover:border-burgundy-800"
              >
                View all →
              </Link>
            </div>
          </ScrollReveal>

          <div className="mt-12">
            {productsLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-burgundy-100 bg-white p-4">
                    <div className="h-36 w-full rounded-xl bg-burgundy-100" />
                    <div className="mt-3 h-4 w-3/4 rounded-full bg-burgundy-100" />
                    <div className="mt-2 h-3 w-1/2 rounded-full bg-burgundy-50" />
                    <div className="mt-3 h-9 w-full rounded-full bg-burgundy-100" />
                  </div>
                ))}
              </div>
            ) : quickGrabs.length === 0 ? (
              <ScrollReveal direction="up">
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-[2rem] border border-burgundy-100 bg-white">
                  <ShoppingBag className="mb-4 h-12 w-12 text-burgundy-200" />
                  <p className="font-serif text-2xl text-burgundy-300">Products coming soon</p>
                  <p className="mt-2 text-sm text-burgundy-400">Check back soon for our curated collection.</p>
                </div>
              </ScrollReveal>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {quickGrabs.map((product, idx) => (
                  <ScrollReveal key={product.id} direction="up" delay={(idx % 6) * 60} className="h-full">
                    <article className="card-lift group flex h-full flex-col rounded-2xl border border-burgundy-100 bg-white p-3 shadow-soft">
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`}
                          alt={product.name}
                          className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-burgundy-700 backdrop-blur">
                          {product.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col px-1 pt-3 pb-1">
                        <h3 className="font-serif text-base text-burgundy-950 leading-snug line-clamp-2">{product.name}</h3>
                        <p className="mt-1 font-serif text-lg text-burgundy-800">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        <button
                          onClick={() => handleAdd(product)}
                          className={`mt-3 rounded-full px-4 py-2 text-xs font-medium transition ${
                            addedId === product.id
                              ? 'bg-green-600 text-white'
                              : 'bg-burgundy-800 text-white hover:bg-burgundy-700'
                          }`}
                        >
                          {addedId === product.id ? '✓ Added' : 'Add to Cart'}
                        </button>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            )}
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
