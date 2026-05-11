import { useCallback, useEffect, useMemo, useState } from 'react'
import { Mail, MessageSquare, RefreshCw, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type ContactSubmission = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  subject: string | null
  message: string | null
  created_at: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function EventEnquiriesPage() {
  const [items, setItems] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('contact_submissions')
      .select('id,full_name,email,phone,subject,message,created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setItems([])
      setError(error.message)
    } else {
      setItems((data as ContactSubmission[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter(item =>
      [item.full_name, item.email, item.phone, item.subject, item.message]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(term))
    )
  }, [items, search])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-burgundy-950">Event Enquiries</h1>
          <p className="mt-1 text-sm text-burgundy-950/50">{filtered.length} contact submissions found</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-burgundy-100 bg-white px-3 py-2 text-sm text-burgundy-700 transition hover:bg-burgundy-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-burgundy-300" />
        <input
          type="text"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search enquiries..."
          className="w-full rounded-lg border border-burgundy-100 bg-white py-2.5 pl-9 pr-4 text-sm text-burgundy-950 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
        />
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load contact submissions: {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-lg border border-burgundy-100 bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-burgundy-100 bg-white py-20 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-burgundy-200" />
          <p className="text-sm text-burgundy-950/45">No event enquiries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-burgundy-100 bg-white shadow-sm">
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-burgundy-50/50"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="min-w-0">
                  <div className="font-medium text-burgundy-950">{item.full_name}</div>
                  <div className="mt-0.5 truncate text-xs text-burgundy-950/45">{item.email || 'No email'} · {item.phone || 'No phone'}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-burgundy-50 px-2.5 py-1 text-xs font-medium text-burgundy-700">
                    {item.subject || 'Enquiry'}
                  </span>
                  <span className="text-xs text-burgundy-950/45">{formatDate(item.created_at)}</span>
                </div>
              </button>

              {expandedId === item.id && (
                <div className="border-t border-burgundy-100 px-5 pb-5 pt-4">
                  <div className="grid gap-5 md:grid-cols-[1fr_1.5fr]">
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-burgundy-950/40">Contact</div>
                        <div className="mt-2 text-burgundy-950">{item.email || 'No email saved'}</div>
                        <div className="text-burgundy-950/60">{item.phone || 'No phone saved'}</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-parchment p-4 text-sm leading-6 text-burgundy-950/75">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-burgundy-950/40">
                        <Mail className="h-4 w-4" />
                        Message
                      </div>
                      {item.message || 'No message content saved.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
