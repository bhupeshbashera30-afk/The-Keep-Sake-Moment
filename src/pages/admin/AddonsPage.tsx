import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Plus, Trash2, Edit2, Check, X, RefreshCw, Layers, Loader2, ArrowUp, ArrowDown, Upload, Image as ImageIcon
} from 'lucide-react'

interface AddOn {
  id: string
  name: string
  emoji: string
  price: number
  description: string
  image_url: string | null
  sort_order: number
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export function AddonsPage() {
  // Addon states
  const [addons, setAddons] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form states for creating new addon
  const [newAddon, setNewAddon] = useState({
    id: '',
    name: '',
    emoji: '',
    price: 0,
    description: '',
    image_url: ''
  })
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<AddOn | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)

  const newFileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  // Fetch addons
  const fetchAddons = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_addons')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setAddons(data || [])
    } catch (err: any) {
      console.error('Error fetching addons:', err)
      alert(`Error fetching addons: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddons()
  }, [])

  // Upload image to Supabase Storage ('product-images' bucket)
  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `addon-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `products/${fileName}`

    setUploading(true)
    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      return `${SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`
    } finally {
      setUploading(false)
    }
  }

  // Handle file input changes for creation
  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImageFile(file)
      setNewImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle file input changes for editing
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditImageFile(file)
      setEditImagePreview(URL.createObjectURL(file))
    }
  }

  // Create Addon Handler
  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddon.id || !newAddon.name || !supabase) return
    setSaving(true)

    try {
      let finalImageUrl = newAddon.image_url.trim() || null

      if (newImageFile) {
        finalImageUrl = await uploadImage(newImageFile)
      }

      const { error } = await supabase
        .from('site_addons')
        .insert({
          id: newAddon.id,
          name: newAddon.name,
          emoji: newAddon.emoji,
          price: newAddon.price,
          description: newAddon.description,
          image_url: finalImageUrl,
          sort_order: addons.length + 1
        })

      if (error) throw error

      // Reset form
      setNewAddon({ id: '', name: '', emoji: '', price: 0, description: '', image_url: '' })
      setNewImageFile(null)
      setNewImagePreview(null)
      if (newFileRef.current) newFileRef.current.value = ''
      
      fetchAddons()
    } catch (err: any) {
      alert(`Error creating addon: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Start Edit
  const handleStartEdit = (item: AddOn) => {
    setEditingId(item.id)
    setEditData({ ...item })
    setEditImageFile(null)
    setEditImagePreview(item.image_url)
  }

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData(null)
    setEditImageFile(null)
    setEditImagePreview(null)
  }

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editData || !editingId || !supabase) return
    setSaving(true)

    try {
      let finalImageUrl = editData.image_url

      if (editImageFile) {
        finalImageUrl = await uploadImage(editImageFile)
      }

      const { error } = await supabase
        .from('site_addons')
        .update({
          name: editData.name,
          emoji: editData.emoji,
          price: editData.price,
          description: editData.description,
          image_url: finalImageUrl
        })
        .eq('id', editingId)

      if (error) throw error

      handleCancelEdit()
      fetchAddons()
    } catch (err: any) {
      alert(`Error updating addon: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Delete Handler
  const handleDeleteAddon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this addon?') || !supabase) return
    try {
      const { error } = await supabase.from('site_addons').delete().eq('id', id)
      if (error) throw error
      fetchAddons()
    } catch (err: any) {
      alert(`Error deleting addon: ${err.message}`)
    }
  }

  // Move / Sort handler
  const handleMoveAddon = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= addons.length) return

    const addonA = addons[index]
    const addonB = addons[newIndex]

    try {
      // Swap sort_order values
      const { error: err1 } = await supabase.from('site_addons').update({ sort_order: addonB.sort_order }).eq('id', addonA.id)
      if (err1) throw err1

      const { error: err2 } = await supabase.from('site_addons').update({ sort_order: addonA.sort_order }).eq('id', addonB.id)
      if (err2) throw err2

      fetchAddons()
    } catch (err: any) {
      console.error('Error swapping sort orders:', err)
      alert(`Error reordering: ${err.message}`)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-burgundy-950 flex items-center gap-2">
          <Layers className="h-7 w-7 text-burgundy-800" />
          Booking Add-ons
        </h1>
        <p className="text-xs text-burgundy-400 mt-1">
          Manage dynamic extra service options available to customers during the checkout booking flow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        {/* Creation Form */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-5 shadow-soft h-fit">
          <h2 className="text-sm font-semibold text-burgundy-950 mb-4 flex items-center gap-1.5 border-b border-burgundy-50 pb-2">
            <Plus className="h-4 w-4 text-burgundy-700" />
            Add New Add-on Option
          </h2>
          <form onSubmit={handleCreateAddon} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">
                Unique ID (lowercase, hyphenated, e.g., 'led-sign')
              </label>
              <input
                type="text"
                required
                placeholder="led-sign"
                value={newAddon.id}
                onChange={e => setNewAddon(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                className="w-full mt-1.5 rounded-xl border border-gray-250 p-2.5 text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
              />
            </div>

            <div className="grid grid-cols-[1fr_3fr] gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Emoji</label>
                <input
                  type="text"
                  required
                  placeholder="💡"
                  value={newAddon.emoji}
                  onChange={e => setNewAddon(prev => ({ ...prev, emoji: e.target.value }))}
                  className="w-full mt-1.5 rounded-xl border border-gray-250 p-2.5 text-center text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Name</label>
                <input
                  type="text"
                  required
                  placeholder="LED Neon Sign"
                  value={newAddon.name}
                  onChange={e => setNewAddon(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-1.5 rounded-xl border border-gray-250 p-2.5 text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="500"
                  value={newAddon.price || ''}
                  onChange={e => setNewAddon(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full mt-1.5 rounded-xl border border-gray-250 p-2.5 text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Description</label>
              <textarea
                rows={3}
                required
                placeholder="Neon sign option with custom birthday lettering..."
                value={newAddon.description}
                onChange={e => setNewAddon(prev => ({ ...prev, description: e.target.value }))}
                className="w-full mt-1.5 rounded-xl border border-gray-250 p-2.5 text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50 resize-none"
              />
            </div>

            {/* Image Upload Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Add-on Image</label>
              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-burgundy-300 hover:bg-burgundy-50/20 transition-all"
                onClick={() => newFileRef.current?.click()}
              >
                {newImagePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                    <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNewImageFile(null)
                        setNewImagePreview(null)
                        if (newFileRef.current) newFileRef.current.value = ''
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 text-center font-medium">Click to upload addon image</p>
                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG (will be saved in product-images bucket)</p>
                  </>
                )}
                <input
                  type="file"
                  ref={newFileRef}
                  accept="image/*"
                  onChange={handleNewFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full py-2.5 bg-burgundy-800 text-white rounded-xl text-xs font-semibold hover:bg-burgundy-700 transition flex items-center justify-center gap-1.5 shadow-glow disabled:opacity-50"
            >
              {saving || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploading ? 'Uploading image...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Add-on
                </>
              )}
            </button>
          </form>
        </div>

        {/* Add-on Items list */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-burgundy-950 mb-4 border-b border-burgundy-50 pb-2">
            Active Booking Add-ons
          </h2>

          {loading ? (
            <div className="py-20 flex justify-center text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : addons.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">No custom add-ons configured.</p>
          ) : (
            <div className="space-y-4">
              {addons.map((item, index) => {
                const isEditing = editingId === item.id
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      isEditing 
                        ? 'border-burgundy-300 bg-burgundy-50/10' 
                        : 'border-gray-150 bg-white hover:border-burgundy-100'
                    }`}
                  >
                    {isEditing && editData ? (
                      /* Editing form representation */
                      <div className="space-y-3">
                        <div className="grid grid-cols-[1fr_3fr_1.5fr] gap-2">
                          <input
                            type="text"
                            placeholder="Emoji"
                            value={editData.emoji}
                            onChange={e => setEditData({ ...editData, emoji: e.target.value })}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-center font-medium outline-none focus:border-burgundy-300"
                          />
                          <input
                            type="text"
                            placeholder="Name"
                            value={editData.name}
                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold outline-none focus:border-burgundy-300"
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            value={editData.price}
                            onChange={e => setEditData({ ...editData, price: Number(e.target.value) })}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-right font-bold outline-none focus:border-burgundy-300"
                          />
                        </div>

                        <textarea
                          rows={2}
                          value={editData.description}
                          onChange={e => setEditData({ ...editData, description: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-700 resize-none outline-none focus:border-burgundy-300"
                        />

                        {/* Edit Image input */}
                        <div className="flex gap-4 items-center">
                          <div className="h-16 w-24 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                            {editImagePreview ? (
                              <img src={editImagePreview} alt="Edit preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <button
                              type="button"
                              onClick={() => editFileRef.current?.click()}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[11px] font-medium border rounded-lg text-gray-600 transition flex items-center gap-1"
                            >
                              <Upload className="h-3 w-3" /> Change Image
                            </button>
                            <input
                              type="file"
                              ref={editFileRef}
                              accept="image/*"
                              onChange={handleEditFileChange}
                              className="hidden"
                            />
                            {editData.image_url && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditData({ ...editData, image_url: null })
                                  setEditImageFile(null)
                                  setEditImagePreview(null)
                                }}
                                className="text-[10px] text-red-600 font-medium hover:underline mt-1 block"
                              >
                                Remove Image
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Save Actions */}
                        <div className="flex justify-end gap-1.5 pt-2 border-t border-gray-100">
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving || uploading}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-semibold transition flex items-center gap-1 disabled:opacity-50"
                          >
                            {saving || uploading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Standard row layout with image preview */
                      <div className="flex gap-3 justify-between items-start">
                        <div className="flex gap-3 min-w-0">
                          {/* Image Box */}
                          <div className="h-16 w-16 bg-burgundy-50/50 border border-burgundy-100/50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-2xl relative shadow-sm">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              item.emoji || '🎁'
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs text-burgundy-950 truncate">{item.name}</span>
                              <span className="px-1.5 py-0.5 bg-burgundy-50 border border-burgundy-100 rounded text-[9px] font-bold text-burgundy-900">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono">({item.id})</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 items-end shrink-0 pl-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100"
                              title="Edit addon"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddon(item.id)}
                              className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-700 hover:bg-red-100"
                              title="Delete addon"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => handleMoveAddon(index, 'up')}
                              disabled={index === 0}
                              className="p-1 bg-gray-50 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleMoveAddon(index, 'down')}
                              disabled={index === addons.length - 1}
                              className="p-1 bg-gray-50 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
