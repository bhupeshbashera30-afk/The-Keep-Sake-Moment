import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'
import { SectionIntro } from '../components/SectionIntro'
import { useProducts, type Product } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'hampers', label: 'Hampers' },
  { key: 'flowers', label: 'Flowers' },
  { key: 'gift_boxes', label: 'Gift Boxes' },
  { key: 'celebration', label: 'Celebration' },
  { key: 'event_addons', label: 'Event Add-ons' },
  { key: 'crochets', label: 'Crochets' },
]

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  
  const setActiveCategory = (cat: string) => {
    setSearchParams(cat === 'all' ? {} : { category: cat })
  }

  const { products, loading } = useProducts(activeCategory === 'all' ? undefined : activeCategory)
  const { addItem } = useCart()
  const [added, setAdded] = useState<string | null>(null)

  const handleAdd = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url ?? undefined, category: product.category })
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1500)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-burgundy-100 bg-gradient-to-br from-burgundy-50 to-rose-50/60 py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <ScrollReveal>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-burgundy-400">Our Collection</p>
            <h1 className="font-serif text-5xl leading-tight text-burgundy-950 md:text-6xl">
              Shop &amp; Gift
            </h1>
            <p className="mt-5 max-w-lg text-lg text-burgundy-600">
              Curated hampers, flowers, gift boxes, and celebration add-ons — everything to make moments unforgettable.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-burgundy-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  activeCategory === cat.key
                    ? 'bg-burgundy-800 text-white shadow-md'
                    : 'border border-burgundy-200 text-burgundy-600 hover:bg-burgundy-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-burgundy-100 bg-white p-6 shadow-soft">
                <div className="mb-5 h-52 w-full rounded-2xl bg-burgundy-100" />
                <div className="mb-2 h-4 w-3/4 rounded-full bg-burgundy-100" />
                <div className="mb-4 h-3 w-1/2 rounded-full bg-burgundy-50" />
                <div className="h-10 w-full rounded-full bg-burgundy-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <ShoppingCart className="mb-4 h-12 w-12 text-burgundy-200" />
            <p className="font-serif text-2xl text-burgundy-300">No products found</p>
            <p className="mt-2 text-sm text-burgundy-400">Check back soon or try another category.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, idx) => (
                <ScrollReveal key={product.id} direction="up" delay={(idx % 3) * 100} className="h-full">
                  <article
                    className="card-lift group flex h-full flex-col rounded-3xl border border-burgundy-100 bg-white p-6 shadow-soft"
                  >
                    <div className="relative mb-5 overflow-hidden rounded-2xl">
                      <img
                        src={product.image_url || `https://picsum.photos/seed/${product.id}/600/400`}
                        alt={product.name}
                        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        width={600}
                        height={400}
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-burgundy-700 backdrop-blur">
                        {product.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-burgundy-950">{product.name}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-burgundy-600">
                      {product.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-serif text-2xl text-burgundy-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleAdd(product)}
                        className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                          added === product.id
                            ? 'bg-green-600 text-white'
                            : 'bg-burgundy-800 text-white hover:bg-burgundy-700'
                        }`}
                      >
                        {added === product.id ? '✓ Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
          </div>
        )}
      </section>
    </>
  )
}
