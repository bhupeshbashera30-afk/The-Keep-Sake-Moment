import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAllProducts, type Product } from '../../hooks/useProducts'

const EMPTY_FORM = {
  name: '', description: '', price: '', image_url: '',
  category: 'hampers', stock: '999',
}

const CATEGORIES = ['hampers', 'flowers', 'gift_boxes', 'celebration', 'event_addons']

export function ProductsPage() {
  const { products, loading, refetch } = useAllProducts()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description, price: String(p.price), image_url: p.image_url || '', category: p.category, stock: String(p.stock) })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url,
      category: form.category,
      stock: parseInt(form.stock),
    }
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert(payload)
    }
    setSaving(false)
    setShowModal(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    await supabase.from('products').delete().eq('id', id)
    setDeleteId(null)
    refetch()
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-gray-900">Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-burgundy-800 px-5 py-2.5 text-sm text-white transition hover:bg-burgundy-700"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-3 h-36 rounded-xl bg-gray-100" />
              <div className="mb-2 h-4 w-2/3 rounded-full bg-gray-100" />
              <div className="h-3 w-1/3 rounded-full bg-gray-50" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => (
            <div key={p.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <img
                src={p.image_url || `https://picsum.photos/seed/${p.id}/400/260`}
                alt={p.name}
                className="mb-4 h-36 w-full rounded-xl object-cover"
              />
              <div className="flex-1">
                <span className="rounded-full bg-burgundy-100 px-2.5 py-0.5 text-xs text-burgundy-700">{p.category.replace('_', ' ')}</span>
                <h3 className="mt-2 font-medium text-gray-900">{p.name}</h3>
                <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{p.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-gray-900">₹{p.price.toLocaleString('en-IN')}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-gray-900">{editing ? 'Edit' : 'Add'} Product</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input name="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Product name" required className="field-input" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} required className="field-input" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Price (₹)" required min="0" step="0.01" className="field-input" />
                <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="Stock" required min="0" className="field-input" />
              </div>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="field-input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="Image URL (optional)" className="field-input" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-gray-200 py-3 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-full bg-burgundy-800 py-3 text-sm text-white hover:bg-burgundy-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center">
            <Trash2 className="mx-auto mb-4 h-10 w-10 text-red-400" />
            <h3 className="mb-2 font-serif text-xl text-gray-900">Delete product?</h3>
            <p className="mb-6 text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-full border border-gray-200 py-3 text-sm text-gray-600">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 rounded-full bg-red-600 py-3 text-sm text-white hover:bg-red-500">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
