import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Check, Package, Upload, ImageIcon } from 'lucide-react'
import { useAllProducts, type Product } from '../../hooks/useProducts'
import { supabase } from '../../lib/supabase'
import { ADMIN_PRODUCT_CATEGORIES } from '../../lib/siteConfig'
import { applyImageFallback, imageFallbackSource, productImageSource } from '../../lib/imageFallbacks'

const CATEGORIES = ADMIN_PRODUCT_CATEGORIES

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

type FormState = {
  name: string
  description: string
  price: string
  image_url: string
  category: string
  stock: string
  is_active: boolean
  gallery_images: string[]
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: 'hampers',
  stock: '0',
  is_active: true,
  gallery_images: [],
}

export function ProductsPage() {
  const { products, loading, refetch } = useAllProducts()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('all')

  // Image upload state
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Gallery upload state
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat)

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setError(null)
    setImageFile(null)
    setImagePreview(null)
    setGalleryFiles([])
    setGalleryPreviews([])
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      image_url: p.image_url ?? '',
      category: p.category,
      stock: String(p.stock),
      is_active: (p as any).is_active ?? true,
      gallery_images: (p as any).gallery_images ?? [],
    })
    setEditingId(p.id)
    setError(null)
    setImageFile(null)
    setImagePreview(p.image_url || null)
    setGalleryFiles([])
    setGalleryPreviews((p as any).gallery_images ?? [])
    setShowModal(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB')
      return
    }

    setImageFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setForm(prev => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleGallerySelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    if (validFiles.length < files.length) {
      setError('Some files were ignored. Ensure they are images and under 5 MB.')
    }

    setGalleryFiles(prev => [...prev, ...validFiles])
    
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => setGalleryPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  function removeGalleryImage(index: number) {
    // If it's a pre-existing URL (not in galleryFiles yet)
    if (index < form.gallery_images.length) {
      setForm(prev => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((_, i) => i !== index)
      }))
    } else {
      // It's a newly added file
      const fileIndex = index - form.gallery_images.length
      setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex))
    }
    
    // Always remove from previews
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadImage(file: File): Promise<string | null> {
    if (!supabase) return null
    setUploading(true)

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    setUploading(false)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Image upload failed: ${uploadError.message}`)
    }

    // Return the public URL
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)
    setError(null)

    try {
      let finalImageUrl = form.image_url.trim() || null

      // Upload new image if one was selected
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile)
      }

      // Upload gallery images
      const newGalleryUrls: string[] = []
      for (const file of galleryFiles) {
        const url = await uploadImage(file)
        if (url) newGalleryUrls.push(url)
      }
      const finalGalleryImages = [...form.gallery_images, ...newGalleryUrls]

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        image_url: finalImageUrl,
        gallery_images: finalGalleryImages,
        category: form.category,
        stock: parseInt(form.stock) || 0,
        is_active: form.is_active,
      }

      const { error: saveError } = editingId
        ? await supabase.from('products').update(payload).eq('id', editingId)
        : await supabase.from('products').insert(payload)

      if (saveError) {
        setError(saveError.message)
      } else {
        setShowModal(false)
        setImageFile(null)
        setImagePreview(null)
        setGalleryFiles([])
        setGalleryPreviews([])
        await refetch()
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!supabase || !window.confirm('Delete this product? This cannot be undone.')) return
    setDeletingId(id)
    await supabase.from('products').delete().eq('id', id)
    await refetch()
    setDeletingId(null)
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">{products.length} total products</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-burgundy-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-burgundy-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {['all', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              filterCat === cat
                ? 'bg-burgundy-800 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded-full bg-gray-100" />
                  <div className="h-3 w-24 rounded-full bg-gray-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <Package className="mb-3 h-10 w-10 text-gray-200" />
          <p className="text-sm text-gray-400">No products found. Add your first product above.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={productImageSource(product.image_url, product.id, product.category)}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover"
                        width={48}
                        height={48}
                        loading="lazy"
                        onError={(event) => applyImageFallback(event, imageFallbackSource(product.id, product.category))}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="mt-0.5 max-w-xs truncate text-xs text-gray-400">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                      {product.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 tabular-nums font-medium text-gray-900">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-gray-700">{product.stock}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      (product as any).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {(product as any).is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:border-burgundy-200 hover:text-burgundy-700"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="mb-5 font-serif text-2xl text-gray-900">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Royal Hamper"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Short product description…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Price (₹) *</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Product Image</label>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="rounded-full bg-white/90 p-2 text-red-600 shadow-lg transition hover:bg-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-white">
                      {imageFile ? imageFile.name : 'Current image'}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-gray-400 transition hover:border-burgundy-300 hover:bg-burgundy-50/30 hover:text-burgundy-600"
                  >
                    <div className="rounded-full bg-white p-3 shadow-sm">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="mt-0.5 text-xs">JPEG, PNG, or WebP · Max 5 MB</p>
                    </div>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex items-center gap-1.5 text-xs text-burgundy-600 transition hover:text-burgundy-800"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Change image
                  </button>
                )}
              </div>

              {/* Gallery Upload */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">Gallery Images (Multiple)</label>
                
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {galleryPreviews.map((preview, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square">
                      <img src={preview} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="rounded-full bg-white/90 p-1.5 text-red-600 shadow-lg transition hover:bg-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 aspect-square text-gray-400 transition hover:border-burgundy-300 hover:text-burgundy-600"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Add Photo</span>
                  </button>
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleGallerySelect}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 accent-burgundy-700"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible in shop)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-burgundy-800 py-2.5 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:opacity-60"
                >
                  {saving || uploading ? (uploading ? 'Uploading image…' : 'Saving…') : (<><Check className="h-4 w-4" />{editingId ? 'Update' : 'Add Product'}</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
