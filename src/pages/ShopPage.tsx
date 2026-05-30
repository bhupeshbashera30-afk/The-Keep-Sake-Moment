import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollReveal } from '../components/ScrollReveal'
import { useProducts, type Product } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { applyImageFallback, imageFallbackSource, productImageSource } from '../lib/imageFallbacks'
import { SHOP_CATEGORIES as SHOP_CATEGORY_CONFIG } from '../lib/siteConfig'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  ...SHOP_CATEGORY_CONFIG,
]

const SHOP_CATEGORIES = new Set(SHOP_CATEGORY_CONFIG.map((cat) => cat.key))

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  
  const setActiveCategory = (cat: string) => {
    setSearchParams(cat === 'all' ? {} : { category: cat })
  }

  const { products, loading } = useProducts(activeCategory === 'all' ? undefined : activeCategory)
  const shopProducts = products.filter((product) => SHOP_CATEGORIES.has(product.category))
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
              Curated hampers, flowers, and handcrafted crochets — everything to make moments unforgettable.
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
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-burgundy-100 bg-white p-2.5 shadow-soft md:rounded-3xl md:p-6">
                <div className="mb-3 h-28 w-full rounded-lg bg-burgundy-100 sm:h-36 md:mb-5 md:h-52 md:rounded-2xl" />
                <div className="mb-2 h-4 w-3/4 rounded-full bg-burgundy-100" />
                <div className="mb-4 h-3 w-1/2 rounded-full bg-burgundy-50" />
                <div className="h-10 w-full rounded-full bg-burgundy-100" />
              </div>
            ))}
          </div>
        ) : shopProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <ShoppingCart className="mb-4 h-12 w-12 text-burgundy-200" />
            <p className="font-serif text-2xl text-burgundy-300">No products found</p>
            <p className="mt-2 text-sm text-burgundy-400">Check back soon or try another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
              {shopProducts.map((product, idx) => (
                <ScrollReveal key={product.id} direction="up" delay={(idx % 3) * 100} className="h-full">
                  <article
                    className="card-lift group flex h-full flex-col rounded-xl border border-burgundy-100 bg-white p-2.5 shadow-soft md:rounded-3xl md:p-6"
                  >
                    <Link to={`/product/${product.id}`} className="relative mb-3 block overflow-hidden rounded-lg md:mb-5 md:rounded-2xl">
                      <img
                        src={productImageSource(product.image_url, product.id, product.category)}
                        alt={product.name}
                        className="h-28 w-full object-contain transition duration-500 group-hover:scale-105 sm:h-36 md:h-52 bg-burgundy-50/10"
                        loading="lazy"
                        width={600}
                        height={400}
                        onError={(event) => applyImageFallback(event, imageFallbackSource(product.id, product.category))}
                      />
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-burgundy-700 backdrop-blur md:left-3 md:top-3 md:px-3 md:py-1 md:text-xs">
                        {product.category.replace('_', ' ')}
                      </span>
                    </Link>
                    <Link to={`/product/${product.id}`} className="group-hover:opacity-80">
                      <h3 className="font-serif text-xs leading-snug text-burgundy-950 line-clamp-2 md:text-xl">{product.name}</h3>
                    </Link>
                    <p className="mt-1 flex-1 text-[11px] leading-5 text-burgundy-600 line-clamp-3 md:mt-1.5 md:text-sm md:leading-relaxed md:line-clamp-none">
                      {product.description}
                    </p>
                    <div className="mt-3 flex flex-col gap-2 md:mt-5 md:flex-row md:items-center md:justify-between md:gap-3">
                      <span className="font-serif text-sm text-burgundy-900 md:text-2xl">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleAdd(product)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition md:px-5 md:py-2.5 md:text-sm ${
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
