import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Gift, Moon, PartyPopper, HeartHandshake, Star, Clock, Award, IceCream, Flower2, ShoppingBag, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { SectionIntro } from '../components/SectionIntro'
import { ScrollReveal } from '../components/ScrollReveal'

import { useProducts, type Product } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { applyImageFallback, imageFallbackSource, productImageSource } from '../lib/imageFallbacks'
import { HERO_SLIDES, HOME_CATEGORY_CARDS, SHOP_CATEGORIES, TESTIMONIALS } from '../lib/siteConfig'

/* ── Stats — REMOVED ── */

export function HomePage() {
  /* ── Hero slideshow state ────────────────────────────────── */
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const startSlideTimer = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current)
    slideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
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
  const prevSlide = () => goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  const nextSlide = () => goToSlide((currentSlide + 1) % HERO_SLIDES.length)

  /* ── Quick grabs products ───────────────────────────────── */
  const { products, loading: productsLoading } = useProducts()
  const { addItem } = useCart()
  const [addedId, setAddedId] = useState<string | null>(null)
  const shopCategoryKeys = new Set(SHOP_CATEGORIES.map((category) => category.key))
  const quickGrabs = products.filter((product) => shopCategoryKeys.has(product.category)).slice(0, 6)

  const handleAdd = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url ?? undefined, category: product.category })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  /* ── Quick Grabs carousel (mobile) ───────────────────────── */
  const quickGrabsScrollRef = useRef<HTMLDivElement>(null)
  const scrollQuickGrabs = (dir: 'left' | 'right') => {
    const el = quickGrabsScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' })
  }

  return (
    <div>
      {/* ── TASK 1: Full-width Hero (no service sidebar) ────── */}
      <section className="relative overflow-hidden bg-[#faf6f3]">
        {/* Full-width landscape image carousel */}
        <div className="relative w-full h-[clamp(220px,45vh,520px)] md:h-[clamp(380px,65vh,760px)]">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: idx === currentSlide ? 1 : 0 }}
            >
              <img
                src={slide.image}
                srcSet={`${slide.image.replace('w=1600', 'w=600').replace('q=80', 'q=60')} 600w, ${slide.image} 1600w`}
                sizes="(max-width: 768px) 600px, 1600px"
                alt={slide.occasion}
                className="h-full w-full object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            </div>
          ))}

          {/* Slide content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-14 lg:p-20">
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                {HERO_SLIDES[currentSlide].occasion}
              </p>
              <h1 className="mt-2 font-serif text-4xl text-white md:text-6xl lg:text-7xl">
                {HERO_SLIDES[currentSlide].tagline}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry'))}
                  className="btn-magnetic rounded-full bg-white px-6 py-3 text-sm font-medium text-burgundy-900 hover:bg-burgundy-50"
                >
                  Start your enquiry
                </button>
              </div>
            </div>

            {/* Slide controls */}
            <div className="mt-6 flex items-center gap-3">
              <button onClick={prevSlide} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30" aria-label="Previous slide">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                {HERO_SLIDES.map((_, idx) => (
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

      </section>

      {/* Stats section REMOVED */}

      {/* ── TASK 4: Categories Grid (2-3 cols on mobile) ─────── */}
      <section className="bg-[#faf6f3] py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal direction="up">
            {/* Highlighted "Categories" eyebrow, no description */}
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-burgundy-700 bg-burgundy-50 inline-block px-3 py-1.5 rounded-full">Categories</p>
            </div>
          </ScrollReveal>

          {/* 2-col on mobile, original desktop layout */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-5">
            {HOME_CATEGORY_CARDS.map((cat, idx) => (
              <ScrollReveal key={cat.slug} direction="up" delay={(idx % 4) * 80} className="h-full">
                <Link
                  to={cat.route}
                  className="card-lift group relative flex h-full flex-col overflow-hidden rounded-[1.2rem] border border-burgundy-100 bg-white shadow-soft md:rounded-[1.5rem]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.image}
                      srcSet={cat.image.includes('unsplash.com') ? `${cat.image.replace('w=600', 'w=300').replace('q=80', 'q=60')} 300w, ${cat.image} 600w` : undefined}
                      sizes="(max-width: 768px) 300px, 600px"
                      alt={cat.label}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 items-center justify-between px-3 py-2.5 sm:px-5 sm:py-4">
                    <h3 className="font-serif text-sm text-burgundy-950 leading-tight sm:text-xl">{cat.label}</h3>
                    <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-burgundy-50 text-burgundy-600 text-xs transition group-hover:bg-burgundy-800 group-hover:text-white">
                      →
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TASK 3: Testimonials — horizontal scroll on mobile ── */}
      <section className="bg-white py-16 border-y border-burgundy-100">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal direction="up">
            <SectionIntro
              eyebrow="Testimonials"
              title="What our clients say."
              description="Every review is a story of trust, care, and moments made unforgettable."
            />
          </ScrollReveal>

          {/* Mobile: horizontal scroll; Desktop: 4-col grid */}
          <div className="mt-10 -mx-4 px-4 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0" style={{ scrollbarWidth: 'none' }}>
            {TESTIMONIALS.map((t, idx) => (
              <article
                key={t.name}
                className="snap-start shrink-0 w-[72vw] max-w-[260px] card-lift flex flex-col rounded-[1.2rem] border border-burgundy-100 bg-parchment p-4 shadow-soft md:w-auto md:max-w-none md:rounded-[1.5rem] md:p-6"
              >
                <Quote className="h-5 w-5 text-burgundy-200 mb-2 md:h-7 md:w-7 md:mb-3" />
                <p className="flex-1 text-xs leading-6 text-burgundy-700 italic md:text-sm md:leading-7">
                  "{t.text}"
                </p>
                <div className="mt-4 border-t border-burgundy-100 pt-3">
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="font-serif text-base text-burgundy-950 md:text-lg">{t.name}</p>
                  <p className="text-[10px] text-burgundy-500 uppercase tracking-[0.2em]">{t.event}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TASK 4: Quick Grabs (2-3 cols on mobile) ─────────── */}
      <section className="bg-[#faf6f3] py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal direction="up">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-burgundy-700 bg-burgundy-50 inline-block px-3 py-1.5 rounded-full">Quick Grabs</p>
              </div>
              <Link
                to="/shop"
                className="btn-magnetic mb-2 rounded-full border border-burgundy-300 px-5 py-2.5 text-sm text-burgundy-800 transition hover:bg-burgundy-800 hover:text-white hover:border-burgundy-800"
              >
                View all →
              </Link>
            </div>
          </ScrollReveal>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-burgundy-100 bg-white p-3">
                  <div className="h-28 w-full rounded-xl bg-burgundy-100" />
                  <div className="mt-3 h-4 w-3/4 rounded-full bg-burgundy-100" />
                  <div className="mt-2 h-3 w-1/2 rounded-full bg-burgundy-50" />
                  <div className="mt-3 h-8 w-full rounded-full bg-burgundy-100" />
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
            /* Mobile: horizontal scroll carousel with nav arrows | Desktop: grid */
            <>
              {/* Mobile horizontal scroll with prev/next arrows */}
              <div className="relative md:hidden">
                {/* Prev arrow */}
                <button
                  onClick={() => scrollQuickGrabs('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md border border-burgundy-100 text-burgundy-700 backdrop-blur -ml-2"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div
                  ref={quickGrabsScrollRef}
                  className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory px-6"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {quickGrabs.map((product) => (
                    <article key={product.id} className="card-lift group flex flex-col rounded-xl border border-burgundy-100 bg-white p-2.5 shadow-soft snap-start flex-shrink-0 w-40">
                      <Link to={`/product/${product.id}`} className="relative block overflow-hidden rounded-lg">
                        <img
                          src={productImageSource(product.image_url, product.id, product.category)}
                          alt={product.name}
                          className="h-28 w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(event) => applyImageFallback(event, imageFallbackSource(product.id, product.category))}
                        />
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-burgundy-700 backdrop-blur">
                          {product.category.replace('_', ' ')}
                        </span>
                      </Link>
                      <div className="flex flex-1 flex-col px-0.5 pt-2 pb-0.5">
                        <Link to={`/product/${product.id}`} className="group-hover:opacity-80">
                          <h3 className="font-serif text-xs text-burgundy-950 leading-snug line-clamp-2">{product.name}</h3>
                        </Link>
                        <p className="mt-1 font-serif text-sm text-burgundy-800">₹{product.price.toLocaleString('en-IN')}</p>
                        <button
                          onClick={() => handleAdd(product)}
                          className={`mt-2 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                            addedId === product.id ? 'bg-green-600 text-white' : 'bg-burgundy-800 text-white hover:bg-burgundy-700'
                          }`}
                        >
                          {addedId === product.id ? '✓ Added' : 'Add to Cart'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Next arrow */}
                <button
                  onClick={() => scrollQuickGrabs('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md border border-burgundy-100 text-burgundy-700 backdrop-blur -mr-2"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Desktop grid */}
              <div className="hidden md:grid gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {quickGrabs.map((product, idx) => (
                  <ScrollReveal key={product.id} direction="up" delay={(idx % 6) * 60} className="h-full">
                    <article className="card-lift group flex h-full flex-col rounded-2xl border border-burgundy-100 bg-white p-3 shadow-soft">
                      <Link to={`/product/${product.id}`} className="relative block overflow-hidden rounded-xl">
                        <img
                          src={productImageSource(product.image_url, product.id, product.category)}
                          alt={product.name}
                          className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(event) => applyImageFallback(event, imageFallbackSource(product.id, product.category))}
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-burgundy-700 backdrop-blur">
                          {product.category.replace('_', ' ')}
                        </span>
                      </Link>
                      <div className="flex flex-1 flex-col px-1 pt-3 pb-1">
                        <Link to={`/product/${product.id}`} className="group-hover:opacity-80">
                          <h3 className="font-serif text-base text-burgundy-950 leading-snug line-clamp-2">{product.name}</h3>
                        </Link>
                        <p className="mt-1 font-serif text-lg text-burgundy-800">₹{product.price.toLocaleString('en-IN')}</p>
                        <button
                          onClick={() => handleAdd(product)}
                          className={`mt-3 rounded-full px-4 py-2 text-xs font-medium transition ${
                            addedId === product.id ? 'bg-green-600 text-white' : 'bg-burgundy-800 text-white hover:bg-burgundy-700'
                          }`}
                        >
                          {addedId === product.id ? '✓ Added' : 'Add to Cart'}
                        </button>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* TASK 2: Enquiry section REMOVED */}
    </div>
  )
}
