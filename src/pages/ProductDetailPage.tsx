import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ShoppingCart, CreditCard } from 'lucide-react'
import { supabase, type Product } from '../lib/supabase'
import { applyImageFallback, imageFallbackSource, productImageSource } from '../lib/imageFallbacks'
import { useCart } from '../context/CartContext'
import { ScrollReveal } from '../components/ScrollReveal'
import { EVENT_DECOR_SUBPAGES } from '../lib/siteConfig'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // For multiple images support
  const [activeImage, setActiveImage] = useState<string | null>(null)

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

      // Fetch similar products in same category
      const { data: similar } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .eq('is_active', true)
        .neq('id', data.id)
        .limit(4)

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

  const isEventDecor = EVENT_DECOR_SUBPAGES.map(s => s.slug).includes(product.category) || product.category === 'event-and-decor'
  const isCustomQuote = !product.price || product.price === 0

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url ?? undefined, category: product.category })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleBuyNow = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url ?? undefined, category: product.category })
    navigate('/checkout')
  }

  const handleEnquire = () => {
    window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { service: product.category, notes: `I would like to enquire about: ${product.name}` } }))
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
            <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden bg-white shadow-soft">
              <img 
                src={productImageSource(activeImage, product.id, product.category)} 
                alt={product.name}
                className="w-full h-full object-cover"
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
                      className="w-full h-full object-cover"
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
            
            {(!isEventDecor && !isCustomQuote) && (
              <p className="font-serif text-3xl text-burgundy-800 mb-6">₹{product.price.toLocaleString('en-IN')}</p>
            )}

            <div className="prose prose-burgundy max-w-none text-burgundy-700 text-sm md:text-base leading-relaxed mb-8">
              <p>{product.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              {(isEventDecor || isCustomQuote) ? (
                <button
                  onClick={handleEnquire}
                  className="flex-1 bg-burgundy-800 text-white rounded-full py-4 px-8 font-medium hover:bg-burgundy-700 transition shadow-md"
                >
                  Enquire Now
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAdd}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-full py-4 px-8 font-medium transition shadow-md ${
                      added ? 'bg-green-600 text-white' : 'bg-burgundy-800 text-white hover:bg-burgundy-700'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {added ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-burgundy-800 text-burgundy-800 rounded-full py-4 px-8 font-medium hover:bg-burgundy-50 transition shadow-sm"
                  >
                    <CreditCard className="h-5 w-5" />
                    Pay Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-20 mx-auto max-w-7xl px-4 md:px-8 border-t border-burgundy-100 pt-16">
          <ScrollReveal direction="up">
            <h2 className="font-serif text-3xl text-burgundy-950 mb-8">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="card-lift group relative block rounded-2xl overflow-hidden bg-white border border-burgundy-100 p-2 shadow-sm hover:shadow-md transition">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-burgundy-50 mb-3">
                    <img 
                      src={productImageSource(p.image_url, p.id, p.category)} 
                      alt={p.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => applyImageFallback(e, imageFallbackSource(p.id, p.category))}
                    />
                  </div>
                  <div className="px-2 pb-2">
                    <h3 className="font-serif text-sm md:text-base text-burgundy-950 line-clamp-1 group-hover:text-burgundy-700">{p.name}</h3>
                    {!(EVENT_DECOR_SUBPAGES.map(s => s.slug).includes(p.category) || p.category === 'event-and-decor' || !p.price) && (
                      <p className="mt-1 font-serif text-burgundy-800 text-sm">₹{p.price.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}
    </div>
  )
}
