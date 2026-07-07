import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Edit2, Check, X, Clipboard, Loader2, ArrowUp, ArrowDown } from 'lucide-react'

interface Term {
  id: number
  term_text: string
  sort_order: number
}

export function SettingsPage() {
  // Term states
  const [terms, setTerms] = useState<Term[]>([])
  const [loadingTerms, setLoadingTerms] = useState(true)
  const [newTermText, setNewTermText] = useState('')
  const [editingTermId, setEditingTermId] = useState<number | null>(null)
  const [editTermText, setEditTermText] = useState('')
  const [termSaving, setTermSaving] = useState(false)

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
    fetchTerms()
  }, [])

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
        <h1 className="font-serif text-3xl text-burgundy-950 flex items-center gap-2">
          <Clipboard className="h-7 w-7 text-burgundy-800" />
          Booking Terms & Conditions
        </h1>
        <p className="text-xs text-burgundy-400 mt-1">Manage dynamic booking policy terms and conditions displayed on your site.</p>
      </div>

      <div className="space-y-6">
        {/* Term Creation */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-5 shadow-soft">
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
              className="px-5 py-2.5 bg-burgundy-800 text-white rounded-xl text-xs font-semibold hover:bg-burgundy-700 transition flex items-center gap-1.5 shadow-glow shrink-0"
            >
              {termSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add Line
            </button>
          </form>
        </div>

        {/* Terms List */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-5 shadow-soft">
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
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium outline-none focus:border-burgundy-300"
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
    </div>
  )
}
