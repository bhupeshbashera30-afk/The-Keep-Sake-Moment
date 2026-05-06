import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Package } from 'lucide-react'
import { useAllProducts, type Product } from '../../hooks/useProducts'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['hampers', 'flowers', 'gift_boxes', 'celebration', 'event_addons']

type FormState = {
  name: string
  description: string
  price: string
  image_url: string
  category: string
  stock: string
  is_active: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: 'hampers',
  stock: '0',
  is_active: true,
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

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat)

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setError(null)
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
    })
    setEditingId(p.id)
    setError(null)
    setShowModal(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      image_url: form.image_url.trim() || null,
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
      await refetch()
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
                        src={product.image_url || `https://picsum.photos/seed/${product.id}/80/80`}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover"
                        width={48}
                        height={48}
                        loading="lazy"
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
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
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

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Image URL</label>
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="mt-2 h-24 w-full rounded-xl object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
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
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-burgundy-800 py-2.5 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : (<><Check className="h-4 w-4" />{editingId ? 'Update' : 'Add Product'}</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
