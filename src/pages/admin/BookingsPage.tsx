import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Gift, RefreshCw, Search, Phone, Mail, Users, Tag, Clock, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { TIME_SLOTS } from '../../lib/siteConfig'

type ConfirmedBooking = {
  id: string
  product_id: string
  order_id: string | null
  booking_date: string
  time_slot: string
  customer_name: string
  email: string | null
  phone: string
  whatsapp: string | null
  num_people: number
  addons: Array<{ id: string; name: string; price: number }>
  addons_total: number
  payment_status: 'pending' | 'paid' | 'failed'
  booking_status?: 'pending' | 'contacted' | 'cancelled'
  created_at: string
  products: {
    name: string
  } | null
}

function formatDate(value: string | null) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function BookingsPage() {
  const [confirmedList, setConfirmedList] = useState<ConfirmedBooking[]>([])
  const [confirmedLoading, setConfirmedLoading] = useState(true)
  const [confirmedSearch, setConfirmedSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch confirmed bookings (Dinner Nights & Event Decor slots)
  const fetchConfirmed = useCallback(async () => {
    if (!supabase) { setConfirmedLoading(false); return }
    setConfirmedLoading(true)
    setError(null)

    // Join with products table using Supabase foreign key select syntax
    const { data, error } = await supabase
      .from('bookings')
      .select('id,product_id,order_id,booking_date,time_slot,customer_name,email,phone,whatsapp,num_people,addons,addons_total,payment_status,booking_status,created_at,products(name)')
      .order('booking_date', { ascending: false })

    if (error) {
      console.error(error)
      setError(error.message)
      setConfirmedList([])
    } else {
      setConfirmedList((data as unknown as ConfirmedBooking[]) ?? [])
    }
    setConfirmedLoading(false)
  }, [])

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'paid' | 'failed') => {
    if (!supabase) return
    setError(null)
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ payment_status: newStatus })
      .eq('id', id)

    if (updateError) {
      console.error(updateError)
      setError(updateError.message)
    } else {
      // Sync the order table payment status if it has an order ID
      const booking = confirmedList.find(b => b.id === id)
      if (booking && booking.order_id) {
        await supabase
          .from('orders')
          .update({ payment_status: newStatus === 'paid' ? 'paid' : newStatus })
          .eq('id', booking.order_id)
      }
      await fetchConfirmed()
    }
  }

  const handleBookingStatusChange = async (id: string, newStatus: 'pending' | 'contacted' | 'cancelled') => {
    if (!supabase) return
    setError(null)
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ booking_status: newStatus })
      .eq('id', id)

    if (updateError) {
      console.error(updateError)
      setError(updateError.message)
    } else {
      await fetchConfirmed()
    }
  }

  const handleDeleteBooking = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this booking slot reservation? This will free up the slot for others to book.')
    if (!confirmDelete) return
    setError(null)
    if (!supabase) return

    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error(deleteError)
      setError(deleteError.message)
    } else {
      await fetchConfirmed()
    }
  }

  useEffect(() => {
    fetchConfirmed()
  }, [fetchConfirmed])

  // Filter list based on search
  const filteredConfirmed = useMemo(() => {
    const term = confirmedSearch.trim().toLowerCase()
    if (!term) return confirmedList
    return confirmedList.filter(item =>
      [
        item.customer_name,
        item.email,
        item.phone,
        item.whatsapp,
        item.products?.name,
        item.time_slot,
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(term))
    )
  }, [confirmedList, confirmedSearch])

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-burgundy-950">Confirmed Bookings</h1>
          <p className="mt-1 text-sm text-burgundy-950/50">
            {filteredConfirmed.length} confirmed paid slots (Dinner Nights, Event & Decor)
          </p>
        </div>
        <button
          onClick={fetchConfirmed}
          className="flex items-center gap-2 rounded-xl border border-burgundy-100 bg-white px-3.5 py-2 text-sm text-burgundy-700 transition hover:bg-burgundy-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${confirmedLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-burgundy-300" />
        <input
          type="text"
          value={confirmedSearch}
          onChange={e => setConfirmedSearch(e.target.value)}
          placeholder="Search bookings by name, item, slot..."
          className="w-full rounded-xl border border-burgundy-100 bg-white py-2.5 pl-9 pr-4 text-sm text-burgundy-950 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
        />
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Confirmed Bookings View */}
      {confirmedLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-burgundy-50 bg-white" />
          ))}
        </div>
      ) : filteredConfirmed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-burgundy-100 bg-white py-16 text-center">
          <Gift className="mb-3 h-10 w-10 text-burgundy-200" />
          <p className="text-sm text-burgundy-950/45">No confirmed bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConfirmed.map(booking => {
            const slotLabel = TIME_SLOTS.find(s => s.id === booking.time_slot)?.label || booking.time_slot
            const isPaid = booking.payment_status === 'paid'
            return (
              <div key={booking.id} className="overflow-hidden rounded-xl border border-burgundy-100 bg-white shadow-soft transition-all">
                {/* Summary Bar */}
                <button
                  onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left hover:bg-burgundy-50/20"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-burgundy-950">{booking.customer_name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isPaid ? 'Paid ✓' : 'Unpaid'}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        booking.booking_status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : booking.booking_status === 'contacted'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.booking_status || 'pending'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-burgundy-950/45">
                      <span className="font-medium text-burgundy-800">{booking.products?.name || 'Unknown Experience'}</span>
                      <span>·</span>
                      <span>{booking.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Date & Slot Badge */}
                    <div className="text-right">
                      <span className="block text-xs font-semibold text-burgundy-900">{formatDate(booking.booking_date)}</span>
                      <span className="block text-[11px] text-burgundy-400">{slotLabel}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-burgundy-300 transition-transform ${expandedId === booking.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded details */}
                {expandedId === booking.id && (
                  <div className="border-t border-burgundy-100 bg-burgundy-50/10 px-5 pb-5 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                      <div className="rounded-lg bg-white border border-burgundy-50 p-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-burgundy-400">
                          <Clock className="h-3.5 w-3.5" />
                          Time Slot
                        </span>
                        <span className="mt-1 block text-sm font-medium text-burgundy-900">{slotLabel}</span>
                      </div>

                      <div className="rounded-lg bg-white border border-burgundy-50 p-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-burgundy-400">
                          <Users className="h-3.5 w-3.5" />
                          Guests count
                        </span>
                        <span className="mt-1 block text-sm font-medium text-burgundy-900">{booking.num_people} people</span>
                      </div>

                      <div className="rounded-lg bg-white border border-burgundy-50 p-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-burgundy-400">
                          <Phone className="h-3.5 w-3.5" />
                          WhatsApp / Call
                        </span>
                        <a href={`https://wa.me/${booking.whatsapp}`} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-medium text-burgundy-800 hover:underline">
                          {booking.whatsapp || booking.phone}
                        </a>
                      </div>

                      <div className="rounded-lg bg-white border border-burgundy-50 p-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-burgundy-400">
                          <Mail className="h-3.5 w-3.5" />
                          Email Address
                        </span>
                        <span className="mt-1 block text-sm font-medium text-burgundy-900 truncate">{booking.email || 'None'}</span>
                      </div>
                    </div>

                    {/* Add-ons List */}
                    <div className="mt-4 rounded-xl border border-burgundy-100 bg-white p-4">
                      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-burgundy-400 mb-3">
                        <Tag className="h-3.5 w-3.5" />
                        Selected Add-ons & Total Cost
                      </h4>
                      
                      <div className="divide-y divide-burgundy-50">
                        {/* Add-ons */}
                        {booking.addons && booking.addons.length > 0 ? (
                          booking.addons.map((a, i) => (
                            <div key={i} className="flex justify-between py-2 text-sm">
                              <span className="text-burgundy-600">{a.name}</span>
                              <span className="font-medium text-burgundy-900">₹{a.price.toLocaleString('en-IN')}</span>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-xs text-burgundy-400">No add-ons selected.</div>
                        )}

                        {/* Totals */}
                        <div className="flex justify-between pt-3 font-semibold text-base">
                          <span className="text-burgundy-950">Grand Total</span>
                          <span className="text-burgundy-900 font-serif">₹{((booking.addons_total || 0) + (booking.addons_total ? 0 : 0)).toLocaleString('en-IN')} (Add-ons: ₹{booking.addons_total?.toLocaleString('en-IN')})</span>
                        </div>
                      </div>
                    </div>

                    {/* Order linkage & status update controls */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-burgundy-400">
                      <span>
                        {booking.order_id ? (
                          <>Order Reference ID: <span className="font-mono">{booking.order_id}</span></>
                        ) : (
                          'No Order Linked'
                        )}
                      </span>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Booking Status Control */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-burgundy-950/50">Booking:</span>
                          <select
                            value={booking.booking_status || 'pending'}
                            onChange={async (e) => {
                              const newStatus = e.target.value as 'pending' | 'contacted' | 'cancelled'
                              await handleBookingStatusChange(booking.id, newStatus)
                            }}
                            className="rounded border border-burgundy-200 bg-white px-2 py-0.5 text-xs text-burgundy-900 font-medium outline-none focus:border-burgundy-400"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Payment status control */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-burgundy-950/50">Payment:</span>
                          <select
                            value={booking.payment_status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as 'pending' | 'paid' | 'failed'
                              await handleStatusChange(booking.id, newStatus)
                            }}
                            className="rounded border border-burgundy-200 bg-white px-2 py-0.5 text-xs text-burgundy-900 font-medium outline-none focus:border-burgundy-400"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>

                        {isPaid && (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified Booking
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete Booking
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
