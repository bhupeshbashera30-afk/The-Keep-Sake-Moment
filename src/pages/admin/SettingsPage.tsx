import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Edit2, Check, X, RefreshCw, Layers, Clipboard, Loader2, ArrowUp, ArrowDown } from 'lucide-react'

interface AddOn {
  id: string
  name: string
  emoji: string
  price: number
  description: string
}

interface Term {
  id: number
  term_text: string
  sort_order: number
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'addons' | 'terms'>('addons')
  
  // Addon states
  const [addons, setAddons] = useState<AddOn[]>([])
  const [loadingAddons, setLoadingAddons] = useState(true)
  const [newAddon, setNewAddon] = useState({ id: '', name: '', emoji: '', price: 0, description: '' })
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null)
  const [editAddonData, setEditAddonData] = useState<AddOn | null>(null)
  const [addonSaving, setAddonSaving] = useState(false)

  // Term states
  const [terms, setTerms] = useState<Term[]>([])
  const [loadingTerms, setLoadingTerms] = useState(true)
  const [newTermText, setNewTermText] = useState('')
  const [editingTermId, setEditingTermId] = useState<number | null>(null)
  const [editTermText, setEditTermText] = useState('')
  const [termSaving, setTermSaving] = useState(false)

  // Fetch data
  const fetchAddons = async () => {
    if (!supabase) return
    setLoadingAddons(true)
    try {
      const { data, error } = await supabase!
        .from('site_addons')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setAddons(data || [])
    } catch (err) {
      console.error('Error fetching addons:', err)
    } finally {
      setLoadingAddons(false)
    }
  }

  const fetchTerms = async () => {
    if (!supabase) return
    setLoadingTerms(true)
    try {
      const { data, error } = await supabase!
        .from('site_terms')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setTerms(data || [])
    } catch (err) {
      console.error('Error fetching terms:', err)
    } finally {
      setLoadingTerms(false)
    }
  }

  useEffect(() => {
    fetchAddons()
    fetchTerms()
  }, [])

  // Addon Handlers
  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddon.id || !newAddon.name || !supabase) return
    setAddonSaving(true)
    try {
      const { error } = await supabase!
        .from('site_addons')
        .insert({
          ...newAddon,
          sort_order: addons.length + 1
        })
      if (error) throw error
      setNewAddon({ id: '', name: '', emoji: '', price: 0, description: '' })
      fetchAddons()
    } catch (err: any) {
      alert(`Error creating addon: ${err.message}`)
    } finally {
      setAddonSaving(false)
    }
  }

  const handleStartEditAddon = (item: AddOn) => {
    setEditingAddonId(item.id)
    setEditAddonData({ ...item })
  }

  const handleCancelEditAddon = () => {
    setEditingAddonId(null)
    setEditAddonData(null)
  }

  const handleSaveEditAddon = async () => {
    if (!editAddonData || !editingAddonId || !supabase) return
    setAddonSaving(true)
    try {
      const { error } = await supabase!
        .from('site_addons')
        .update({
          name: editAddonData.name,
          emoji: editAddonData.emoji,
          price: editAddonData.price,
          description: editAddonData.description
        })
        .eq('id', editingAddonId)
      if (error) throw error
      setEditingAddonId(null)
      setEditAddonData(null)
      fetchAddons()
    } catch (err: any) {
      alert(`Error updating addon: ${err.message}`)
    } finally {
      setAddonSaving(false)
    }
  }

  const handleDeleteAddon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this addon?') || !supabase) return
    try {
      const { error } = await supabase!.from('site_addons').delete().eq('id', id)
      if (error) throw error
      fetchAddons()
    } catch (err: any) {
      alert(`Error deleting addon: ${err.message}`)
    }
  }

  // Term Handlers
  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTermText.trim() || !supabase) return
    setTermSaving(true)
    try {
      const { error } = await supabase!
        .from('site_terms')
        .insert({
          term_text: newTermText.trim(),
          sort_order: terms.length + 1
        })
      if (error) throw error
      setNewTermText('')
      fetchTerms()
    } catch (err: any) {
      alert(`Error creating term: ${err.message}`)
    } finally {
      setTermSaving(false)
    }
  }

  const handleSaveEditTerm = async (id: number) => {
    if (!editTermText.trim() || !supabase) return
    setTermSaving(true)
    try {
      const { error } = await supabase!
        .from('site_terms')
        .update({ term_text: editTermText.trim() })
        .eq('id', id)
      if (error) throw error
      setEditingTermId(null)
      setEditTermText('')
      fetchTerms()
    } catch (err: any) {
      alert(`Error updating term: ${err.message}`)
    } finally {
      setTermSaving(false)
    }
  }

  const handleDeleteTerm = async (id: number) => {
    if (!confirm('Are you sure you want to delete this term line?') || !supabase) return
    try {
      const { error } = await supabase!.from('site_terms').delete().eq('id', id)
      if (error) throw error
      fetchTerms()
    } catch (err: any) {
      alert(`Error deleting term: ${err.message}`)
    }
  }

  const handleMoveTerm = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= terms.length) return

    const termA = terms[index]
    const termB = terms[newIndex]

    try {
      // Swap sort_order
      await supabase!.from('site_terms').update({ sort_order: termB.sort_order }).eq('id', termA.id)
      await supabase!.from('site_terms').update({ sort_order: termA.sort_order }).eq('id', termB.id)
      fetchTerms()
    } catch (err) {
      console.error('Error swapping sort orders:', err)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-burgundy-950">Site Settings</h1>
        <p className="text-xs text-burgundy-400 mt-1">Manage dynamic booking add-ons and policy terms displayed on your site.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('addons')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition ${
            activeTab === 'addons'
              ? 'border-burgundy-800 text-burgundy-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Layers className="h-4 w-4" />
          Booking Add-ons
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition ${
            activeTab === 'terms'
              ? 'border-burgundy-800 text-burgundy-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Clipboard className="h-4 w-4" />
          Terms & Conditions
        </button>
      </div>

      {/* Booking Add-ons Tab */}
      {activeTab === 'addons' && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          {/* Add-on Creation */}
          <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-soft h-fit">
            <h2 className="text-sm font-semibold text-burgundy-950 mb-4 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-burgundy-700" />
              Add New Add-on Option
            </h2>
            <form onSubmit={handleCreateAddon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Unique ID (lowercase, e.g., 'balloon')</label>
                <input
                  type="text"
                  required
                  placeholder="balloon"
                  value={newAddon.id}
                  onChange={e => setNewAddon(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full mt-1.5 rounded-xl border border-gray-250 p-2.5 text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
                />
              </div>

              <div className="grid grid-cols-[1fr_3fr] gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Emoji</label>
                  <input
                    type="text"
                    required
                    placeholder="🎈"
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
                    placeholder="Balloon Decor"
                    value={newAddon.name}
                    onChange={e => setNewAddon(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1.5 rounded-xl border border-gray-250 p-2.5 text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Keepsake balloon cluster setup..."
                  value={newAddon.description}
                  onChange={e => setNewAddon(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mt-1.5 rounded-xl border border-gray-250 p-2.5 text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={addonSaving}
                className="w-full py-2.5 bg-burgundy-800 text-white rounded-xl text-xs font-semibold hover:bg-burgundy-700 transition flex items-center justify-center gap-1.5 shadow-glow"
              >
                {addonSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Add-on
              </button>
            </form>
          </div>

          {/* Add-on List */}
          <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-burgundy-950 mb-4">Active Booking Add-ons</h2>
            {loadingAddons ? (
              <div className="py-20 flex justify-center text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : addons.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-10">No custom add-ons configured.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {addons.map(item => {
                  const isEditing = editingAddonId === item.id
                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      {isEditing && editAddonData ? (
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-[1fr_4fr_2fr] gap-2">
                            <input
                              type="text"
                              value={editAddonData.emoji}
                              onChange={e => setEditAddonData({ ...editAddonData, emoji: e.target.value })}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-center font-medium"
                            />
                            <input
                              type="text"
                              value={editAddonData.name}
                              onChange={e => setEditAddonData({ ...editAddonData, name: e.target.value })}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold"
                            />
                            <input
                              type="number"
                              value={editAddonData.price}
                              onChange={e => setEditAddonData({ ...editAddonData, price: Number(e.target.value) })}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-right font-bold"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={editAddonData.description}
                            onChange={e => setEditAddonData({ ...editAddonData, description: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-700 resize-none"
                          />
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <div className="h-10 w-10 bg-burgundy-50 border border-burgundy-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                            {item.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-gray-900">{item.name}</span>
                              <span className="px-1.5 py-0.2 bg-burgundy-50 border border-burgundy-100 rounded text-[9px] font-bold text-burgundy-900">
                                ₹{item.price}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      )}

                      {/* Addon Actions */}
                      <div className="flex gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEditAddon}
                              disabled={addonSaving}
                              className="p-1.5 bg-green-50 border border-green-150 rounded-lg text-green-700 hover:bg-green-100"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEditAddon}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEditAddon(item)}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddon(item.id)}
                              className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms & Conditions Tab */}
      {activeTab === 'terms' && (
        <div className="space-y-6">
          {/* Term Creation */}
          <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-burgundy-950 mb-3">Add Terms & Conditions Line</h2>
            <form onSubmit={handleCreateTerm} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter a new policy statement for your booking Terms & Conditions..."
                value={newTermText}
                onChange={e => setNewTermText(e.target.value)}
                className="flex-1 rounded-xl border border-gray-250 p-2.5 text-xs text-gray-900 outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
              />
              <button
                type="submit"
                disabled={termSaving}
                className="px-5 py-2.5 bg-burgundy-800 text-white rounded-xl text-xs font-semibold hover:bg-burgundy-700 transition flex items-center gap-1.5 shadow-glow"
              >
                {termSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Line
              </button>
            </form>
          </div>

          {/* Terms List */}
          <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-burgundy-950 mb-4">Active Terms Lines</h2>
            {loadingTerms ? (
              <div className="py-20 flex justify-center text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : terms.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-10">No custom terms configured.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {terms.map((term, index) => {
                  const isEditing = editingTermId === term.id
                  return (
                    <div key={term.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTermText}
                          onChange={e => setEditTermText(e.target.value)}
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium"
                        />
                      ) : (
                        <div className="flex items-start gap-3">
                          <span className="text-[11px] font-bold text-burgundy-700 font-mono mt-0.5 bg-burgundy-50 h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs text-gray-800 leading-relaxed">{term.term_text}</span>
                        </div>
                      )}

                      {/* Term Actions */}
                      <div className="flex gap-1 items-center shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEditTerm(term.id)}
                              disabled={termSaving}
                              className="p-1.5 bg-green-50 border border-green-150 rounded-lg text-green-700 hover:bg-green-100"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => { setEditingTermId(null); setEditTermText('') }}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleMoveTerm(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveTerm(index, 'down')}
                              disabled={index === terms.length - 1}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => { setEditingTermId(term.id); setEditTermText(term.term_text) }}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTerm(term.id)}
                              className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
