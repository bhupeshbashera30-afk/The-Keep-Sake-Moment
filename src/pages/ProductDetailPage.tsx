import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart, CreditCard, CheckCircle2, AlertCircle, Settings, XCircle, Package } from 'lucide-react'
import { supabase, type Product } from '../lib/supabase'
import { applyImageFallback, imageFallbackSource, productImageSource } from '../lib/imageFallbacks'
import { useCart } from '../context/CartContext'
import { ScrollReveal } from '../components/ScrollReveal'
import { EVENT_DECOR_SUBPAGES } from '../lib/siteConfig'

// ── Structured Description ──────────────────────────────────────────────────
// Parses the raw description into labeled sections using known keywords.
// All styling uses only the website's burgundy palette.

const SECTION_MAP: { pattern: RegExp; title: string; icon: React.ReactNode }[] = [
  {
    pattern: /what.?s included in this decoration package|what.?s included|included in this/i,
    title: "What's Included",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  {
    pattern: /important notes?/i,
    title: 'Important Notes',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  {
    pattern: /setup (?:guidelines?|notes?|info)/i,
    title: 'Setup Guidelines',
    icon: <Settings className="h-3.5 w-3.5" />,
  },
  {
    pattern: /cancellation\s*(?:&|and)?\s*complaint policy|cancellation policy|complaint policy/i,
    title: 'Cancellation & Policy',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
]

// Split the raw text at known section headers — only once per header type
function splitIntoSections(raw: string): { title: string; icon: React.ReactNode; body: string }[] {
  // Find all split positions
  const positions: { index: number; def: typeof SECTION_MAP[0] }[] = []

  for (const def of SECTION_MAP) {
    const match = raw.match(def.pattern)
    if (match && match.index !== undefined) {
      positions.push({ index: match.index, def })
    }
  }

  if (positions.length === 0) return []

  // Sort by position
  positions.sort((a, b) => a.index - b.index)

  const sections: { title: string; icon: React.ReactNode; body: string }[] = []

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index
    const end = i + 1 < positions.length ? positions[i + 1].index : raw.length
    const chunk = raw.slice(start, end).trim()

    // Remove the matched header label from the start
    const body = chunk.replace(positions[i].def.pattern, '').replace(/^[\s:]+/, '').trim()

    sections.push({ title: positions[i].def.title, icon: positions[i].def.icon, body })
  }

  return sections
}

// Split a body string into bullet items
function bodyToItems(body: string): string[] {
  return body
    .split(/(?<=[.!?])\s+(?=[A-Z])|[\n\r]+/)
    .map(s => s.trim())
    .filter(s => s.length > 3)
}

function StructuredDescription({ raw }: { raw: string }) {
  const sections = splitIntoSections(raw)

  // Intro block = text before the first section header
  const firstPos = raw.search(
    /what.?s included in this decoration package|what.?s included|included in this|important notes?|setup (?:guidelines?|notes?|info)|cancellation/i
  )
  const intro = firstPos > 0 ? raw.slice(0, firstPos).trim() : ''

  if (sections.length === 0) {
    return (
      <div className="text-sm leading-relaxed text-burgundy-700 mb-6">
        <p>{raw}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Intro paragraph if any */}
      {intro && (
        <p className="text-sm leading-relaxed text-burgundy-700">{intro}</p>
      )}

      {sections.map((sec, i) => {
        const items = bodyToItems(sec.body)
        // Alternate between two burgundy shades for visual separation
        const isAlt = i % 2 === 1
        return (
          <div
            key={i}
            className={`rounded-xl border border-burgundy-200 px-4 py-3 ${isAlt ? 'bg-burgundy-50/60' : 'bg-white'}`}
          >
            {/* Section header */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-burgundy-700 mb-2">
              {sec.icon}
              {sec.title}
            </div>
            {/* Items */}
            <ul className="space-y-1">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-[13px] leading-snug text-burgundy-800">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────


export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedSimilarId, setAddedSimilarId] = useState<string | null>(null)
  
  // For multiple images support
  const [activeImage, setActiveImage] = useState<string | null>(null)

  // Similar products carousel ref
  const similarScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollability = () => {
    const el = similarScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  const scrollSimilar = (dir: 'left' | 'right') => {
    const el = similarScrollRef.current
    if (!el) return
    const cardWidth = el.querySelector<HTMLElement>(':scope > *')?.offsetWidth || 220
    el.scrollBy({ left: dir === 'right' ? cardWidth * 2 : -(cardWidth * 2), behavior: 'smooth' })
  }

  useEffect(() => {
    const el = similarScrollRef.current
    if (!el) return
    checkScrollability()
    el.addEventListener('scroll', checkScrollability, { passive: true })
    window.addEventListener('resize', checkScrollability)
    return () => {
      el.removeEventListener('scroll', checkScrollability)
      window.removeEventListener('resize', checkScrollability)
    }
  }, [similarProducts])

  useEffect(() => {
    async function fetchProduct() {
      if (!supabase || !id) return
      setLoading(true)
      
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error || !data) {
        setProduct(null)
        setLoading(false)
        return
      }

      setProduct(data as Product)
      setActiveImage(data.image_url)

      // Fetch similar products in same category (more for carousel)
      const { data: similar } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .eq('is_active', true)
        .neq('id', data.id)
        .neq('name', 'Homepage Settings')
        .limit(12)

      if (similar) {
        setSimilarProducts(similar as Product[])
      }
      
      setLoading(false)
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse">
        <div className="h-64 w-full bg-burgundy-50 rounded-3xl mb-8"></div>
        <div className="h-10 w-1/3 bg-burgundy-100 mx-auto rounded-full mb-4"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-28 text-center">
        <h1 className="font-serif text-4xl text-burgundy-950 mb-4">Product Not Found</h1>
        <button onClick={() => navigate(-1)} className="text-burgundy-600 underline">Go back</button>
      </div>
    )
  }

  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean) as string[]

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url ?? undefined, category: product.category })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleAddSimilar = (p: Product) => {
    addItem({ id: p.id, name: p.name, price: p.price, image_url: p.image_url ?? undefined, category: p.category })
    setAddedSimilarId(p.id)
    setTimeout(() => setAddedSimilarId(null), 1500)
  }

  const handleBuyNow = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url ?? undefined, category: product.category })
    navigate('/checkout')
  }

  return (
    <div className="bg-[#faf6f3] min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-burgundy-600 mb-8 hover:text-burgundy-800 transition">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images Section */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden bg-[#f7f1ee] shadow-soft">
              <img 
                src={productImageSource(activeImage, product.id, product.category)} 
                alt={product.name}
                className="w-full h-full object-contain bg-[#f7f1ee]"
                onError={(e) => applyImageFallback(e, imageFallbackSource(product.id, product.category))}
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none' }}>
                {allImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 snap-start transition ${activeImage === img ? 'border-burgundy-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img 
                      src={productImageSource(img, product.id, product.category)} 
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain bg-[#f7f1ee]"
                      onError={(e) => applyImageFallback(e, imageFallbackSource(product.id, product.category))}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-center">
            <span className="inline-block px-3 py-1 bg-burgundy-100 text-burgundy-700 rounded-full text-xs font-bold uppercase tracking-widest w-max mb-4">
              {product.category.replace('_', ' ')}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-burgundy-950 leading-tight mb-4">{product.name}</h1>
            
            {product.price > 0 && (
              <p className="font-serif text-3xl text-burgundy-800 mb-6">₹{product.price.toLocaleString('en-IN')}</p>
            )}

            {/* Structured Description */}
            <StructuredDescription raw={product.description ?? ''} />

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 rounded-full py-4 px-8 font-medium transition shadow-md ${
                  added ? 'bg-green-600 text-white' : 'bg-burgundy-800 text-white hover:bg-burgundy-700'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {added ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-burgundy-800 text-burgundy-800 rounded-full py-4 px-8 font-medium hover:bg-burgundy-50 transition shadow-sm"
              >
                <CreditCard className="h-5 w-5" />
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Products Carousel ────────────────────────── */}
      {similarProducts.length > 0 && (
        <section className="mt-16 border-t border-burgundy-100 pt-12 pb-4">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <ScrollReveal direction="up">
              {/* Header with navigation arrows */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-burgundy-500 mb-1">Similar Products</p>
                  <h2 className="font-serif text-2xl md:text-3xl text-burgundy-950">You may also like</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollSimilar('left')}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition shadow-sm ${
                      canScrollLeft
                        ? 'border-burgundy-200 bg-white text-burgundy-700 hover:bg-burgundy-50 hover:border-burgundy-300 cursor-pointer'
                        : 'border-burgundy-100 bg-burgundy-50/50 text-burgundy-300 cursor-not-allowed'
                    }`}
                    disabled={!canScrollLeft}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollSimilar('right')}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition shadow-sm ${
                      canScrollRight
                        ? 'border-burgundy-200 bg-white text-burgundy-700 hover:bg-burgundy-50 hover:border-burgundy-300 cursor-pointer'
                        : 'border-burgundy-100 bg-burgundy-50/50 text-burgundy-300 cursor-not-allowed'
                    }`}
                    disabled={!canScrollRight}
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Carousel container */}
              <div className="relative">
                {/* Left fade overlay */}
                {canScrollLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#faf6f3] to-transparent z-10 pointer-events-none" />
                )}

                {/* Scrollable row */}
                <div
                  ref={similarScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {similarProducts.map((p) => {
                    return (
                      <article
                        key={p.id}
                        className="group flex-shrink-0 snap-start w-[48%] sm:w-[32%] md:w-[23%] lg:w-[18%] flex flex-col rounded-2xl border border-burgundy-100 bg-white shadow-soft overflow-hidden transition hover:shadow-lg hover:-translate-y-1"
                      >
                        {/* Image with link */}
                        <Link to={`/product/${p.id}`} className="relative block overflow-hidden aspect-square bg-burgundy-50">
                          <img
                            src={productImageSource(p.image_url, p.id, p.category)}
                            alt={p.name}
                            className="w-full h-full object-contain transition duration-500 group-hover:scale-110 bg-[#f7f1ee]"
                            loading="lazy"
                            onError={(e) => applyImageFallback(e, imageFallbackSource(p.id, p.category))}
                          />
                          {/* Category badge */}
                          <span className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-burgundy-700">
                            {p.category.replace('_', ' ')}
                          </span>
                        </Link>

                        {/* Product info */}
                        <div className="flex flex-1 flex-col p-3">
                          <Link to={`/product/${p.id}`} className="hover:opacity-80 transition">
                            <h3 className="font-serif text-sm md:text-base text-burgundy-950 leading-snug line-clamp-2 mb-1">
                              {p.name}
                            </h3>
                          </Link>

                          {p.price > 0 && (
                            <p className="font-serif text-base text-burgundy-800 font-medium mt-auto">
                              ₹{p.price.toLocaleString('en-IN')}
                            </p>
                          )}

                          {/* Action button */}
                          <div className="mt-2">
                            <button
                              onClick={() => handleAddSimilar(p)}
                              className={`w-full rounded-full px-3 py-2 text-xs font-medium transition ${
                                addedSimilarId === p.id
                                  ? 'bg-green-600 text-white'
                                  : 'bg-burgundy-800 text-white hover:bg-burgundy-700'
                              }`}
                            >
                              {addedSimilarId === p.id ? '✓ Added' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>

                {/* Right fade overlay */}
                {canScrollRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#faf6f3] to-transparent z-10 pointer-events-none" />
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  )
}
