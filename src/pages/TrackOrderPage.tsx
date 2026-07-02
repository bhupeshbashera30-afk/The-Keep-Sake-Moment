import { useState } from 'react'
import { Search, Package, MapPin, Clock, Calendar, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ScrollReveal } from '../components/ScrollReveal'

type OrderItem = {
  id: string
  name: string
  price: number
  qty: number
}

type OrderDetails = {
  id: string
  customer_name: string
  email: string | null
  phone: string | null
  address: string | null
  products: OrderItem[]
  total: number
  payment_status: string
  order_status: string
  short_id?: string
  created_at: string
}

type BookingDetails = {
  booking_date: string
  time_slot: string
  num_people: number
  addons: Array<{ name: string; price: number }>
  booking_status: string
}

const STAGES = ['processing', 'confirmed', 'preparing', 'dispatched', 'delivered']
const STAGE_LABELS: Record<string, string> = {
  processing: 'Processing',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  dispatched: 'Dispatched / Shipped',
  delivered: 'Delivered',
}

const STAGE_DESCS: Record<string, string> = {
  processing: 'We have received your order details and are setting things up.',
  confirmed: 'Your order has been verified and confirmed.',
  preparing: 'Our team is hand-crafting and preparing your gifts.',
  dispatched: 'Your order has been handed over to our delivery partner.',
  delivered: 'Your order has reached its destination. Enjoy your keepsake!',
}

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [booking, setBooking] = useState<BookingDetails | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return

    // Clean up potential hash prefixes
    const formattedId = orderId.trim().replace('#', '')

    setLoading(true)
    setError(null)
    setOrder(null)
    setBooking(null)

    try {
      if (!supabase) throw new Error('Supabase client not initialized.')

      // Query order table by short_id (8 chars or less) or full UUID
      const isShortId = !formattedId.includes('-') && formattedId.length <= 8
      const selectCols = 'id,customer_name,email,phone,address,products,total,payment_status,order_status,short_id,created_at'

      let orderData: Record<string, unknown> | null = null
      let orderErr: Error | null = null

      if (isShortId) {
        const res = await supabase
          .from('orders')
          .select(selectCols)
          .eq('short_id', formattedId.toUpperCase())
          .maybeSingle()
        orderData = res.data as Record<string, unknown> | null
        orderErr = res.error
      } else {
        const res = await supabase
          .from('orders')
          .select(selectCols)
          .eq('id', formattedId)
          .maybeSingle()
        orderData = res.data as Record<string, unknown> | null
        orderErr = res.error
      }

      if (orderErr) throw orderErr
      if (!orderData) {
        setError('Order not found. Please verify the Reference ID and try again.')
        setLoading(false)
        return
      }

      setOrder(orderData as unknown as OrderDetails)

      // If it is a booking order, fetch the bookings table details as well
      const isBooking = orderData.address?.startsWith('Booking:')
      if (isBooking) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('booking_date,time_slot,num_people,addons,booking_status')
          .eq('order_id', orderData.id)
          .maybeSingle()

        if (bookingData) {
          setBooking(bookingData as BookingDetails)
        }
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Something went wrong while tracking your order.')
    } finally {
      setLoading(false)
    }
  }

  // Determine current active stage index
  const currentStageIndex = order ? STAGES.indexOf(order.order_status) : -1

  return (
    <div className="bg-[#faf6f3] min-h-screen pb-20">
      {/* Hero */}
      <section className="relative border-b border-burgundy-100 bg-gradient-to-br from-burgundy-50 to-rose-50/60 py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-burgundy-400">Where is my package?</p>
            <h1 className="font-serif text-4xl md:text-5xl text-burgundy-950">Track Your Order</h1>
            <p className="mt-2 text-sm text-burgundy-600">Enter your order ID below to get real-time status updates.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Track Section */}
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        {/* Search Bar */}
        <div className="rounded-3xl border border-burgundy-100 bg-white p-6 shadow-soft mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-burgundy-300" />
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Paste Order Reference ID (e.g. 8d573973...)"
                required
                className="w-full rounded-2xl border border-burgundy-100 bg-[#faf6f3]/30 py-3.5 pl-12 pr-4 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-burgundy-800 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:opacity-50"
            >
              {loading ? 'Tracking…' : 'Track Status'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Tracking Details Render */}
        {order && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="rounded-3xl border border-burgundy-100 bg-white p-6 shadow-soft flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-burgundy-400">Order Reference</span>
                <h2 className="text-lg font-mono font-semibold text-burgundy-950">#{order.short_id || order.id.slice(0, 8).toUpperCase()}</h2>
                <p className="text-xs text-burgundy-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-burgundy-400 block">Total</span>
                  <span className="font-serif text-xl font-semibold text-burgundy-950">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  order.payment_status === 'paid' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                }`}>
                  {order.payment_status === 'paid' ? 'Paid ✓' : 'Unpaid'}
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            {order.order_status === 'cancelled' ? (
              <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6 text-center text-red-800">
                <h3 className="font-serif text-xl font-semibold">This Order Was Cancelled</h3>
                <p className="text-sm mt-1">Please contact customer support at support@keepsakemoments.com if you have any questions.</p>
              </div>
            ) : (
              <div className="rounded-3xl border border-burgundy-100 bg-white p-6 md:p-8 shadow-soft">
                <h3 className="font-serif text-xl text-burgundy-950 mb-8 flex items-center gap-2">
                  <Package className="h-5 w-5 text-burgundy-600" />
                  Delivery Timeline
                </h3>

                <div className="relative pl-6 md:pl-8 border-l border-burgundy-100 space-y-8 ml-3">
                  {STAGES.map((stage, index) => {
                    const isCompleted = index < currentStageIndex
                    const isActive = index === currentStageIndex
                    const isUpcoming = index > currentStageIndex

                    return (
                      <div key={stage} className="relative">
                        {/* Dot indicator */}
                        <div className={`
                          absolute -left-[35px] md:-left-[43px] top-1.5 flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full border-2 transition-all duration-300
                          ${isCompleted 
                            ? 'bg-green-600 border-green-600 text-white' 
                            : isActive 
                              ? 'bg-burgundy-800 border-burgundy-800 text-white shadow-glow scale-110' 
                              : 'bg-white border-burgundy-100 text-burgundy-200'
                          }
                        `}>
                          <span className="text-[10px] md:text-xs font-semibold">{index + 1}</span>
                        </div>

                        {/* Stage details */}
                        <div className={`transition ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                          <h4 className={`text-base font-semibold ${isActive ? 'text-burgundy-950' : 'text-burgundy-800'}`}>
                            {STAGE_LABELS[stage]}
                          </h4>
                          {isActive && (
                            <p className="mt-1 text-sm text-burgundy-600 max-w-md">
                              {STAGE_DESCS[stage]}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Booking Details card (if it's a booking) */}
            {booking && (
              <div className="rounded-3xl border border-burgundy-100 bg-burgundy-50/30 p-6 shadow-soft">
                <h3 className="font-serif text-lg text-burgundy-950 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-burgundy-700" />
                  Reservation Details
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-burgundy-400 block">Date</span>
                    <p className="font-semibold text-burgundy-900 mt-0.5">
                      {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-burgundy-400 block">Time Slot</span>
                    <p className="font-semibold text-burgundy-900 mt-0.5">{booking.time_slot}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-burgundy-400 block">Guest Count</span>
                    <p className="font-semibold text-burgundy-900 mt-0.5">{booking.num_people} people</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-burgundy-400 block">Status</span>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider mt-1 ${
                      booking.booking_status === 'cancelled'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : booking.booking_status === 'contacted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {booking.booking_status || 'pending'}
                    </span>
                  </div>
                </div>

                {booking.addons && booking.addons.length > 0 && (
                  <div className="mt-4 border-t border-burgundy-100 pt-4">
                    <span className="text-xs uppercase tracking-wider text-burgundy-400 block mb-2">Selected Add-ons</span>
                    <div className="flex flex-wrap gap-2">
                      {booking.addons.map((a, i) => (
                        <span key={i} className="rounded-full bg-white border border-burgundy-100 px-3 py-1 text-xs text-burgundy-800">
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Info */}
            <div className="rounded-3xl border border-burgundy-100 bg-white p-6 shadow-soft space-y-4">
              <h3 className="font-serif text-lg text-burgundy-950 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-burgundy-600" />
                Items Purchased
              </h3>
              
              <ul className="divide-y divide-burgundy-50 text-sm">
                {order.products.map((item, i) => (
                  <li key={i} className="flex justify-between py-3">
                    <span className="text-burgundy-700 font-medium">
                      {item.name} <span className="text-burgundy-400 ml-1">× {item.qty}</span>
                    </span>
                    <span className="font-semibold text-burgundy-950">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>

              {order.address && (
                <div className="border-t border-burgundy-50 pt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-burgundy-400 mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Delivery Address
                  </h4>
                  <p className="text-sm text-burgundy-800 leading-relaxed whitespace-pre-line">
                    {order.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
