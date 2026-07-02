import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Mail, MessageSquare, RefreshCw, Search, Phone, Users, MapPin, Tag, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type BookingRequest = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  service_interest: string | null
  event_date: string | null
  event_location: string | null
  budget_range: string | null
  guest_count: number | null
  notes: string | null
  created_at: string
}

function formatDate(value: string | null) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function EventEnquiriesPage() {
  const [items, setItems] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    setError(null)

    // Fetch from booking_requests table (represents event inquiry form entries)
    const { data, error } = await supabase
      .from('booking_requests')
      .select('id,full_name,email,phone,service_interest,event_date,event_location,budget_range,guest_count,notes,created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setItems([])
      setError(error.message)
    } else {
      setItems((data as BookingRequest[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const handleDeleteEnquiry = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this enquiry request? This action cannot be undone.')
    if (!confirmDelete) return
    setError(null)
    if (!supabase) return

    const { error: deleteError } = await supabase
      .from('booking_requests')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error(deleteError)
      setError(deleteError.message)
    } else {
      await refetch()
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter(item =>
      [item.full_name, item.email, item.phone, item.service_interest, item.event_location, item.budget_range, item.notes]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(term))
    )
  }, [items, search])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-burgundy-950 font-serif">Event Enquiries</h1>
          <p className="mt-1 text-sm text-burgundy-950/50">{filtered.length} event enquiries found</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl border border-burgundy-100 bg-white px-3.5 py-2 text-sm text-burgundy-700 transition hover:bg-burgundy-50 shadow-sm"
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
          className="w-full rounded-xl border border-burgundy-100 bg-white py-2.5 pl-9 pr-4 text-sm text-burgundy-950 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
        />
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl border border-burgundy-50 bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-burgundy-100 bg-white py-20 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-burgundy-200" />
          <p className="text-sm text-burgundy-950/45">No event enquiries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-burgundy-100 bg-white shadow-soft transition-all">
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-burgundy-50/20"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-burgundy-950">{item.full_name}</div>
                  <div className="mt-0.5 truncate text-xs text-burgundy-950/45">{item.email || 'No email'} · {item.phone || 'No phone'}</div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-full bg-burgundy-50 px-2.5 py-1 text-xs font-medium text-burgundy-700">
                    {item.service_interest || 'General'}
                  </span>
                  <span className="text-xs text-burgundy-950/45">{formatDate(item.created_at)}</span>
                  <ChevronRight className={`h-4 w-4 text-burgundy-300 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {expandedId === item.id && (
                <div className="border-t border-burgundy-100 px-5 pb-5 pt-4 bg-burgundy-50/10">
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div className="rounded-lg bg-white border border-burgundy-50 p-3">
                      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-burgundy-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Event Date
                      </span>
                      <span className="mt-1 block text-sm font-medium text-burgundy-950">{formatDate(item.event_date)}</span>
                    </div>

                    <div className="rounded-lg bg-white border border-burgundy-50 p-3">
                      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-burgundy-400">
                        <MapPin className="h-3.5 w-3.5" />
                        Location
                      </span>
                      <span className="mt-1 block text-sm font-medium text-burgundy-950 truncate">{item.event_location || 'Not set'}</span>
                    </div>

                    <div className="rounded-lg bg-white border border-burgundy-50 p-3">
                      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-burgundy-400">
                        <Users className="h-3.5 w-3.5" />
                        Guest Count
                      </span>
                      <span className="mt-1 block text-sm font-medium text-burgundy-950">{item.guest_count || 'Not set'}</span>
                    </div>

                    <div className="rounded-lg bg-white border border-burgundy-50 p-3">
                      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-burgundy-400">
                        <Tag className="h-3.5 w-3.5" />
                        Budget Range
                      </span>
                      <span className="mt-1 block text-sm font-medium text-burgundy-950">{item.budget_range || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-burgundy-100 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-burgundy-400">
                      <Mail className="h-4 w-4" />
                      Client Message & Notes
                    </div>
                    <div className="text-sm leading-relaxed text-burgundy-950/85 whitespace-pre-line">
                      {item.notes || 'No message contents provided.'}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDeleteEnquiry(item.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-800 transition hover:bg-red-100 shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Enquiry
                    </button>
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

function ChevronRight({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
