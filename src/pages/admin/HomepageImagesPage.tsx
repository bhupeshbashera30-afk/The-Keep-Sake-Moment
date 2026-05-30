import React, { useState, useEffect, useRef } from 'react'
import { Save, Upload, Trash2, Image as ImageIcon, LayoutGrid, Sliders, MessageSquare, Star, Plus, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { HERO_SLIDES, HOME_CATEGORY_CARDS, TESTIMONIALS } from '../../lib/siteConfig'

type HeroSlide = {
  image: string
  occasion: string
  tagline: string
}

type CategoryImages = {
  [key: string]: string
}

type Testimonial = {
  name: string
  event: string
  text: string
  rating: number
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export function HomepageImagesPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'categories' | 'testimonials'>('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    { image: '', occasion: '', tagline: '' },
    { image: '', occasion: '', tagline: '' },
    { image: '', occasion: '', tagline: '' },
  ])
  const [categoryImages, setCategoryImages] = useState<CategoryImages>({
    'event-and-decor': '',
    'flowers': '',
    'hampers': '',
    'crochets': '',
    'dinner-night': '',
  })
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  // File upload refs
  const slideFileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  
  const categoryFileInputRefs: { [key: string]: React.RefObject<HTMLInputElement | null> } = {
    'event-and-decor': useRef<HTMLInputElement>(null),
    'flowers': useRef<HTMLInputElement>(null),
    'hampers': useRef<HTMLInputElement>(null),
    'crochets': useRef<HTMLInputElement>(null),
    'dinner-night': useRef<HTMLInputElement>(null),
  }

  useEffect(() => {
    async function loadSettings() {
      if (!supabase) return
      setLoading(true)
      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('name', 'Homepage Settings')
          .maybeSingle()

        if (fetchError) {
          setError(fetchError.message)
        } else if (data && data.description) {
          const settings = JSON.parse(data.description)
          if (settings.heroSlides) {
            const slides = [...settings.heroSlides]
            while (slides.length < 3) {
              slides.push({ image: '', occasion: '', tagline: '' })
            }
            setHeroSlides(slides.slice(0, 3))
          } else {
            setHeroSlides(HERO_SLIDES)
          }

          if (settings.categories) {
            setCategoryImages({
              'event-and-decor': settings.categories['event-and-decor'] || '',
              'flowers': settings.categories['flowers'] || '',
              'hampers': settings.categories['hampers'] || '',
              'crochets': settings.categories['crochets'] || '',
              'dinner-night': settings.categories['dinner-night'] || '',
            })
          } else {
            const defaults: CategoryImages = {}
            HOME_CATEGORY_CARDS.forEach(card => {
              defaults[card.slug] = card.image
            })
            setCategoryImages(defaults)
          }

          if (settings.testimonials && Array.isArray(settings.testimonials)) {
            setTestimonials(settings.testimonials)
          } else {
            setTestimonials(TESTIMONIALS)
          }
        } else {
          // Initialize state with config defaults
          setHeroSlides(HERO_SLIDES)
          const defaults: CategoryImages = {}
          HOME_CATEGORY_CARDS.forEach(card => {
            defaults[card.slug] = card.image
          })
          setCategoryImages(defaults)
          setTestimonials(TESTIMONIALS)
        }
      } catch (err: any) {
        setError(err.message || 'Error loading settings')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  async function uploadImage(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `homepage-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`
  }

  async function handleSlideFileChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const url = await uploadImage(file)
      setHeroSlides(prev => {
        const copy = [...prev]
        copy[index] = { ...copy[index], image: url }
        return copy
      })
    } catch (err: any) {
      setError(err.message || 'Error uploading slide image')
    } finally {
      setSaving(false)
    }
  }

  async function handleCategoryFileChange(slug: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const url = await uploadImage(file)
      setCategoryImages(prev => ({
        ...prev,
        [slug]: url,
      }))
    } catch (err: any) {
      setError(err.message || 'Error uploading category image')
    } finally {
      setSaving(false)
    }
  }

  function handleSlideTextChange(index: number, field: 'occasion' | 'tagline', value: string) {
    setHeroSlides(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  // Testimonial Handlers
  function handleTestimonialChange(index: number, field: keyof Testimonial, value: any) {
    setTestimonials(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  function addTestimonial() {
    setTestimonials(prev => [
      ...prev,
      { name: '', event: '', text: '', rating: 5 }
    ])
  }

  function removeTestimonial(index: number) {
    setTestimonials(prev => prev.filter((_, idx) => idx !== index))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const payload = {
      heroSlides,
      categories: categoryImages,
      testimonials,
    }

    try {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', 'Homepage Settings')
        .maybeSingle()

      const savePayload = {
        name: 'Homepage Settings',
        description: JSON.stringify(payload),
        price: 0,
        image_url: heroSlides[0]?.image || null,
        category: 'event-and-decor',
        stock: 0,
        is_active: true,
      }

      const { error: saveError } = existing
        ? await supabase.from('products').update(savePayload).eq('id', existing.id)
        : await supabase.from('products').insert([savePayload])

      if (saveError) {
        setError(saveError.message)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-burgundy-700 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Homepage Customization</h1>
          <p className="mt-1 text-sm text-gray-500">Edit the hero slideshow banner images, captions, category grids, and client testimonials.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'hero'
                ? 'border-burgundy-800 text-burgundy-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Hero Slides
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'categories'
                ? 'border-burgundy-800 text-burgundy-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Category Card Images
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('testimonials')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'testimonials'
                ? 'border-burgundy-800 text-burgundy-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Testimonials
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Homepage customization saved successfully!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6 pb-20">
        {activeTab === 'hero' ? (
          <div className="space-y-6">
            {heroSlides.map((slide, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-serif text-lg text-gray-900 border-b pb-2 flex items-center justify-between">
                  <span>Slide {idx + 1}</span>
                  <span className="text-xs font-sans text-gray-400 font-normal">Slideshow banner</span>
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Slide Image</label>
                    {slide.image ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-50">
                        <img src={slide.image} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition flex items-center justify-center opacity-0 hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => {
                              setHeroSlides(prev => {
                                const copy = [...prev]
                                copy[idx] = { ...copy[idx], image: '' }
                                return copy
                              })
                            }}
                            className="rounded-full bg-white/95 p-2 text-red-600 shadow-md hover:bg-white transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => slideFileInputRefs[idx].current?.click()}
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 aspect-[4/3] text-gray-400 hover:border-burgundy-300 hover:bg-burgundy-50/30 hover:text-burgundy-600 transition"
                      >
                        <Upload className="h-5 w-5" />
                        <span className="text-xs font-medium">Upload Image</span>
                      </button>
                    )}
                    <input
                      ref={slideFileInputRefs[idx]}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSlideFileChange(idx, e)}
                      className="hidden"
                    />
                    
                    {slide.image && (
                      <button
                        type="button"
                        onClick={() => slideFileInputRefs[idx].current?.click()}
                        className="mt-2 text-xs font-medium text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
                      >
                        <ImageIcon className="h-3 w-3" />
                        Replace Image
                      </button>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Occasion Label (Eyebrow)</label>
                      <input
                        type="text"
                        value={slide.occasion}
                        onChange={(e) => handleSlideTextChange(idx, 'occasion', e.target.value)}
                        placeholder="e.g. Luxury Hampers"
                        required
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Tagline (Main Title)</label>
                      <input
                        type="text"
                        value={slide.tagline}
                        onChange={(e) => handleSlideTextChange(idx, 'tagline', e.target.value)}
                        placeholder="e.g. Crafted moments worth keeping"
                        required
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Raw Image URL (Alternative to upload)</label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => {
                          const val = e.target.value
                          setHeroSlides(prev => {
                            const copy = [...prev]
                            copy[idx] = { ...copy[idx], image: val }
                            return copy
                          })
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'categories' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_CATEGORY_CARDS.map(card => {
              const currentImageUrl = categoryImages[card.slug]
              return (
                <div key={card.slug} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="mb-1.5 font-serif text-base text-gray-900 leading-tight">
                      {card.label}
                    </h3>
                    <p className="mb-4 text-xs text-gray-400">{card.description}</p>
                    
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-50 mb-3">
                      {currentImageUrl ? (
                        <>
                          <img src={currentImageUrl} alt={card.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition flex items-center justify-center opacity-0 hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryImages(prev => ({ ...prev, [card.slug]: '' }))
                              }}
                              className="rounded-full bg-white/95 p-2 text-red-600 shadow-md hover:bg-white transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => categoryFileInputRefs[card.slug]?.current?.click()}
                          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 w-full h-full text-gray-400 hover:border-burgundy-300 hover:bg-burgundy-50/30 hover:text-burgundy-600 transition"
                        >
                          <Upload className="h-4.5 w-4.5" />
                          <span className="text-[11px] font-medium">Upload Card Image</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      ref={categoryFileInputRefs[card.slug] as any}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCategoryFileChange(card.slug, e)}
                      className="hidden"
                    />
                    
                    <input
                      type="text"
                      value={currentImageUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setCategoryImages(prev => ({ ...prev, [card.slug]: val }))
                      }}
                      placeholder="Image URL..."
                      className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[10px] text-gray-600 focus:border-burgundy-300 focus:outline-none focus:ring-1 focus:ring-burgundy-100"
                    />

                    {currentImageUrl && (
                      <button
                        type="button"
                        onClick={() => categoryFileInputRefs[card.slug]?.current?.click()}
                        className="mt-2 text-xs font-medium text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
                      >
                        <ImageIcon className="h-3 w-3" />
                        Replace Card Image
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-xl text-gray-900">Manage Client Reviews</h2>
              <button
                type="button"
                onClick={addTestimonial}
                className="flex items-center gap-2 rounded-xl bg-burgundy-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-burgundy-700"
              >
                <Plus className="h-4 w-4" />
                Add Testimonial
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {testimonials.map((t, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 relative">
                  <button
                    type="button"
                    onClick={() => removeTestimonial(idx)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition"
                    title="Remove Testimonial"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <h4 className="font-serif text-sm font-semibold text-gray-700 pb-1 border-b border-gray-100">
                    Testimonial #{idx + 1}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Client Name</label>
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => handleTestimonialChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        required
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Event / Occasion</label>
                      <input
                        type="text"
                        value={t.event}
                        onChange={(e) => handleTestimonialChange(idx, 'event', e.target.value)}
                        placeholder="e.g. Birthday Celebration"
                        required
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Rating (1 to 5 Stars)</label>
                    <div className="flex gap-2 items-center">
                      <select
                        value={t.rating}
                        onChange={(e) => handleTestimonialChange(idx, 'rating', Number(e.target.value))}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100 bg-white"
                      >
                        {[5, 4, 3, 2, 1].map(stars => (
                          <option key={stars} value={stars}>{stars} Stars</option>
                        ))}
                      </select>
                      <div className="flex gap-0.5 text-gold">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Review Text</label>
                    <textarea
                      value={t.text}
                      onChange={(e) => handleTestimonialChange(idx, 'text', e.target.value)}
                      placeholder="Enter the client's detailed feedback..."
                      required
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                    />
                  </div>
                </div>
              ))}
            </div>

            {testimonials.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No testimonials yet. Click "Add Testimonial" above.</p>
              </div>
            )}
          </div>
        )}

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/80 p-4 shadow-lg backdrop-blur-md lg:left-64">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              * Edits are applied live to the home page once saved.
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-burgundy-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-60 shadow-md"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
