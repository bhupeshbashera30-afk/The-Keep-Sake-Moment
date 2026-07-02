import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CreditCard, Lock, Calendar, Clock, Gift, Users, ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { useBookingSlots } from '../hooks/useBookingSlots'
import { TIME_SLOTS, ADDONS, TERMS_AND_CONDITIONS, isBookingCategory, type AddOn } from '../lib/siteConfig'

declare global {
  interface Window { Razorpay: any }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string

async function callEdgeFunction(fnName: string, body: object) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Edge function error (${res.status})`)
  return data
}

// ── Calendar Component ───────────────────────────────────────────────────────
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function MiniCalendar({
  selectedDate,
  onSelectDate,
  fullyBookedDates = new Set<string>(),
  partiallyBookedDates = new Set<string>(),
}: {
  selectedDate: string | null
  onSelectDate: (date: string) => void
  fullyBookedDates?: Set<string>
  partiallyBookedDates?: Set<string>
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const isPastMonth = viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth < today.getMonth())

  return (
    <div className="rounded-2xl border border-burgundy-100 bg-white p-4 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={isPastMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-burgundy-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 text-burgundy-600" />
        </button>
        <span className="font-serif text-lg text-burgundy-950">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-burgundy-50"
        >
          <ChevronRight className="h-4 w-4 text-burgundy-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-medium text-burgundy-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isPast = dateStr < todayStr
          const isFullyBooked = fullyBookedDates.has(dateStr)
          const isPartiallyBooked = partiallyBookedDates.has(dateStr)
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === todayStr
          const isDisabled = isPast || isFullyBooked

          return (
            <button
              key={day}
              onClick={() => !isDisabled && onSelectDate(dateStr)}
              disabled={isDisabled}
              className={`
                relative h-9 w-full rounded-lg text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-burgundy-800 text-white shadow-[0_2px_8px_rgba(91,33,49,0.3)] scale-105'
                  : isDisabled
                    ? 'text-burgundy-200 cursor-not-allowed'
                    : isToday
                      ? 'bg-burgundy-50 text-burgundy-900 hover:bg-burgundy-100 ring-1 ring-burgundy-200'
                      : 'text-burgundy-700 hover:bg-burgundy-50'
                }
              `}
            >
              {day}
              {/* Dot indicators */}
              {isFullyBooked && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-red-400" />
              )}
              {isPartiallyBooked && !isFullyBooked && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-burgundy-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Fully booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Partially booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Available
        </div>
      </div>
    </div>
  )
}

// ── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Date & Time', icon: Calendar },
  { label: 'Add-ons', icon: Gift },
  { label: 'Details', icon: Users },
  { label: 'Terms', icon: FileText },
  { label: 'Payment', icon: CreditCard },
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-10">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isActive = i === currentStep
        const isDone = i < currentStep
        return (
          <div key={i} className="flex items-center">
            <div className={`
              flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300
              ${isActive
                ? 'bg-burgundy-800 text-white shadow-[0_2px_12px_rgba(91,33,49,0.3)]'
                : isDone
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-burgundy-50 text-burgundy-400 border border-burgundy-100'
              }
            `}>
              {isDone ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-px w-4 sm:w-6 transition-colors ${i < currentStep ? 'bg-green-300' : 'bg-burgundy-100'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}


// ── Main Checkout Component ──────────────────────────────────────────────────
export function CheckoutPage() {
  const { cart, total, clearCart, bookingMeta, setBookingMeta, bookingTotal } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Determine if this is a booking checkout or regular cart checkout
  const hasBookingItems = useMemo(() => {
    if (bookingMeta) return true
    return cart.some(item => item.category && isBookingCategory(item.category))
  }, [cart, bookingMeta])

  // ── Booking Flow State ─────────────────────────────────────
  const [step, setStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set())
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    num_people: '1',
  })

  // Regular cart form
  const [regularForm, setRegularForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    street_address: '',
    area: '',
    city: '',
    nearby: '',
    district: 'Nainital',
    state: 'Uttarakhand',
    pin_code: '',
  })

  // Get the booking product info
  const bookingProduct = bookingMeta ? {
    id: bookingMeta.productId,
    name: bookingMeta.productName,
    price: bookingMeta.productPrice,
    category: bookingMeta.category,
  } : cart.find(item => item.category && isBookingCategory(item.category))

  // Fetch time slots for the selected date
  const { slots, loading: slotsLoading } = useBookingSlots(bookingProduct?.id, selectedDate)

  // Calculate addons total
  const addonsTotal = useMemo(() => {
    return ADDONS.filter(a => selectedAddons.has(a.id)).reduce((sum, a) => sum + a.price, 0)
  }, [selectedAddons])

  // Compute final booking total
  const finalBookingTotal = (bookingProduct?.price || 0) + addonsTotal

  // Pre-populate from bookingMeta if available
  useEffect(() => {
    if (bookingMeta) {
      setSelectedDate(bookingMeta.bookingDate)
      setSelectedSlot(bookingMeta.timeSlot)
      if (bookingMeta.addons.length > 0) {
        setSelectedAddons(new Set(bookingMeta.addons.map(a => a.id)))
      }
    }
  }, [bookingMeta])

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMsg(null)
  }

  const handleRegularFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRegularForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMsg(null)
  }

  // Step validation
  const canProceed = (s: number) => {
    switch (s) {
      case 0: return !!selectedDate && !!selectedSlot
      case 1: return true // addons are optional
      case 2: return bookingForm.customer_name.trim() && bookingForm.email.trim() && bookingForm.phone.trim() && bookingForm.whatsapp.trim() && parseInt(bookingForm.num_people) > 0
      case 3: return termsAccepted
      default: return true
    }
  }

  // ── Booking Checkout Handler ───────────────────────────────
  const handleBookingCheckout = async () => {
    if (!bookingProduct || !selectedDate || !selectedSlot || !supabase) return
    setLoading(true)
    setErrorMsg(null)

    const selectedAddonsList = ADDONS.filter(a => selectedAddons.has(a.id)).map(a => ({ id: a.id, name: a.name, price: a.price }))
    const slotLabel = TIME_SLOTS.find(s => s.id === selectedSlot)?.label || selectedSlot

    try {
      // Step 1: Create order
      const orderProducts = [
        { id: bookingProduct.id, name: bookingProduct.name, price: bookingProduct.price, qty: 1 },
        ...selectedAddonsList.map(a => ({ id: a.id, name: a.name, price: a.price, qty: 1 })),
      ]

      const { data: insertedRows, error: orderError } = await supabase!
        .from('orders')
        .insert({
          customer_name: bookingForm.customer_name,
          email: bookingForm.email,
          phone: bookingForm.phone,
          address: `Booking: ${selectedDate} | ${slotLabel} | ${bookingForm.num_people} people | WhatsApp: ${bookingForm.whatsapp}`,
          products: orderProducts,
          total: finalBookingTotal,
          payment_status: 'pending',
          order_status: 'processing',
        })
        .select('id')

      if (orderError) throw new Error(`Order failed: ${orderError.message}`)
      if (!insertedRows?.length) throw new Error('Order created but could not retrieve ID.')

      const orderId = insertedRows[0].id

      // Step 2: Create booking record
      const { error: bookingError } = await supabase!
        .from('bookings')
        .insert({
          product_id: bookingProduct.id,
          order_id: orderId,
          booking_date: selectedDate,
          time_slot: selectedSlot,
          customer_name: bookingForm.customer_name,
          email: bookingForm.email,
          phone: bookingForm.phone,
          whatsapp: bookingForm.whatsapp,
          num_people: parseInt(bookingForm.num_people),
          addons: selectedAddonsList,
          addons_total: addonsTotal,
          payment_status: 'pending',
        })

      if (bookingError) {
        console.error('Booking insert error:', bookingError)
        // Don't throw — order is created, just log the booking error
      }

      // Step 3: Razorpay payment
      if (RAZORPAY_KEY_ID) {
        const rzpOrder = await callEdgeFunction('create-razorpay-order', {
          amount: finalBookingTotal,
          currency: 'INR',
          order_db_id: orderId,
        })

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: Math.round(finalBookingTotal * 100),
          currency: 'INR',
          name: 'Keepsake Moments',
          description: `Booking: ${bookingProduct.name} – ${slotLabel}`,
          order_id: rzpOrder.razorpay_order_id,
          prefill: {
            name: bookingForm.customer_name,
            email: bookingForm.email,
            contact: bookingForm.phone,
          },
          theme: { color: '#6b1e2f' },
          modal: {
            ondismiss: () => {
              setLoading(false)
              setErrorMsg('Payment was cancelled. Your booking is saved — try again when ready.')
            },
          },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              await callEdgeFunction('verify-razorpay-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_db_id: orderId,
              })

              // Mark booking as paid
              await supabase!
                .from('bookings')
                .update({ payment_status: 'paid' })
                .eq('order_id', orderId)

              // Auto-send confirmation email (fire-and-forget)
              supabase!.functions.invoke('send-order-email', { body: { order_id: orderId } }).catch(console.error)

              clearCart()
              navigate('/order-success?id=' + orderId)
            } catch (verifyErr: any) {
              setErrorMsg('Payment received but verification failed. Contact us with payment ID: ' + response.razorpay_payment_id)
              setLoading(false)
            }
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response: any) => {
          setErrorMsg(`Payment failed: ${response.error.description || 'Please try again.'}`)
          setLoading(false)
        })
        rzp.open()
      } else {
        // Dev mode: skip Razorpay
        await supabase!.from('orders').update({ payment_status: 'paid', order_status: 'confirmed' }).eq('id', orderId)
        await supabase!.from('bookings').update({ payment_status: 'paid' }).eq('order_id', orderId)
        clearCart()
        navigate('/order-success?id=' + orderId)
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Booking checkout error:', err)
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // ── Regular Cart Checkout Handler (unchanged logic) ────────
  const handleRegularCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart.length || !supabase) return
    setLoading(true)
    setErrorMsg(null)

    const concatenatedAddress = `${regularForm.street_address}, ${regularForm.area}, ${regularForm.city}${regularForm.nearby ? `, Nearby: ${regularForm.nearby}` : ''}, District: ${regularForm.district}, State: ${regularForm.state}, PIN: ${regularForm.pin_code}`

    try {
      const { data: insertedRows, error: orderError } = await supabase!
        .from('orders')
        .insert({
          customer_name: regularForm.customer_name,
          email: regularForm.email,
          phone: regularForm.phone,
          address: concatenatedAddress,
          products: cart,
          total,
          payment_status: 'pending',
          order_status: 'processing',
        })
        .select('id')

      if (orderError) throw new Error(`Order failed: ${orderError.message}`)
      if (!insertedRows?.length) throw new Error('Order created but could not retrieve ID.')

      const orderId = insertedRows[0].id

      if (RAZORPAY_KEY_ID) {
        const rzpOrder = await callEdgeFunction('create-razorpay-order', {
          amount: total,
          currency: 'INR',
          order_db_id: orderId,
        })

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: Math.round(total * 100),
          currency: 'INR',
          name: 'Keepsake Moments',
          description: 'Event gifts & keepsakes',
          order_id: rzpOrder.razorpay_order_id,
          prefill: {
            name: regularForm.customer_name,
            email: regularForm.email,
            contact: regularForm.phone,
          },
          theme: { color: '#6b1e2f' },
          modal: {
            ondismiss: () => {
              setLoading(false)
              setErrorMsg('Payment was cancelled. Your cart is saved — try again when ready.')
            },
          },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              await callEdgeFunction('verify-razorpay-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_db_id: orderId,
              })

              // Auto-send confirmation email (fire-and-forget)
              supabase!.functions.invoke('send-order-email', { body: { order_id: orderId } }).catch(console.error)

              clearCart()
              navigate('/order-success?id=' + orderId)
            } catch (verifyErr: any) {
              setErrorMsg('Payment received but verification failed. Contact us with payment ID: ' + response.razorpay_payment_id)
              setLoading(false)
            }
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response: any) => {
          setErrorMsg(`Payment failed: ${response.error.description || 'Please try again.'}`)
          setLoading(false)
        })
        rzp.open()
      } else {
        await supabase!.from('orders').update({ payment_status: 'paid', order_status: 'confirmed' }).eq('id', orderId)
        clearCart()
        navigate('/order-success?id=' + orderId)
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // ── RENDER: Booking Flow ───────────────────────────────────
  if (hasBookingItems && bookingProduct) {
    const slotLabel = TIME_SLOTS.find(s => s.id === selectedSlot)?.label || ''

    return (
      <>
        {/* Hero */}
        <section className="relative border-b border-burgundy-100 bg-gradient-to-br from-burgundy-50 to-rose-50/60 py-16">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <ScrollReveal>
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-burgundy-400">Book your experience</p>
              <h1 className="font-serif text-4xl md:text-5xl text-burgundy-950">Checkout</h1>
              <p className="mt-2 text-sm text-burgundy-600">{bookingProduct.name}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5">
                <ShieldCheck className="h-4 w-4 text-green-600" strokeWidth={2} />
                <span className="text-xs font-medium text-green-700">Secured by Razorpay</span>
                <Lock className="h-3 w-3 text-green-500" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 md:px-8">
          <StepIndicator currentStep={step} />

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* ── Step 0: Date & Time ── */}
              {step === 0 && (
                <div className="space-y-6 animate-in fade-in-0 duration-300">
                  <div>
                    <h2 className="font-serif text-2xl text-burgundy-900 mb-1">Select Date</h2>
                    <p className="text-sm text-burgundy-500">Choose your preferred date for the experience</p>
                  </div>
                  <MiniCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />

                  {selectedDate && (
                    <div className="mt-6">
                      <h3 className="font-serif text-xl text-burgundy-900 mb-1 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-burgundy-600" />
                        Available Time Slots
                      </h3>
                      <p className="text-sm text-burgundy-500 mb-4">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>

                      {slotsLoading ? (
                        <div className="grid grid-cols-2 gap-3">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-16 animate-pulse rounded-xl bg-burgundy-50" />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {slots.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => slot.status === 'available' && setSelectedSlot(slot.id)}
                              disabled={slot.status === 'booked'}
                              className={`
                                relative rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200
                                ${slot.status === 'booked'
                                  ? 'border-red-100 bg-red-50/60 text-red-300 cursor-not-allowed'
                                  : selectedSlot === slot.id
                                    ? 'border-burgundy-800 bg-burgundy-800 text-white shadow-[0_4px_16px_rgba(91,33,49,0.25)]'
                                    : 'border-burgundy-100 bg-white text-burgundy-700 hover:border-burgundy-300 hover:shadow-soft'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <span>{slot.label}</span>
                                {slot.status === 'booked' && (
                                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                    Booked
                                  </span>
                                )}
                                {selectedSlot === slot.id && slot.status === 'available' && (
                                  <Check className="h-4 w-4" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setStep(1)}
                    disabled={!canProceed(0)}
                    className="w-full mt-4 rounded-full bg-burgundy-800 py-3.5 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to Add-ons →
                  </button>
                </div>
              )}

              {/* ── Step 1: Add-ons ── */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in-0 duration-300">
                  <div>
                    <h2 className="font-serif text-2xl text-burgundy-900 mb-1">Choose Add-ons</h2>
                    <p className="text-sm text-burgundy-500">Enhance your experience with these optional extras</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {ADDONS.map(addon => {
                      const isSelected = selectedAddons.has(addon.id)
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`
                            relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200
                            ${isSelected
                              ? 'border-burgundy-800 bg-burgundy-50/80 shadow-[0_2px_12px_rgba(91,33,49,0.12)]'
                              : 'border-burgundy-100 bg-white hover:border-burgundy-200 hover:shadow-soft'
                            }
                          `}
                        >
                          {/* Checkbox indicator */}
                          <div className={`
                            mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all
                            ${isSelected
                              ? 'border-burgundy-800 bg-burgundy-800'
                              : 'border-burgundy-200'
                            }
                          `}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-burgundy-900">
                                {addon.emoji} {addon.name}
                              </span>
                              <span className={`text-sm font-serif font-semibold ${isSelected ? 'text-burgundy-800' : 'text-burgundy-600'}`}>
                                ₹{addon.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-burgundy-500">{addon.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {selectedAddons.size > 0 && (
                    <div className="rounded-xl border border-burgundy-100 bg-burgundy-50/50 px-4 py-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-burgundy-600">{selectedAddons.size} add-on{selectedAddons.size > 1 ? 's' : ''} selected</span>
                        <span className="font-medium text-burgundy-900">+₹{addonsTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(0)}
                      className="rounded-full border border-burgundy-200 px-6 py-3 text-sm font-medium text-burgundy-700 transition hover:bg-burgundy-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 rounded-full bg-burgundy-800 py-3 text-sm font-medium text-white transition hover:bg-burgundy-700"
                    >
                      Continue to Details →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Booking Details ── */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in-0 duration-300">
                  <div>
                    <h2 className="font-serif text-2xl text-burgundy-900 mb-1">Booking Details</h2>
                    <p className="text-sm text-burgundy-500">Tell us about your group</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="booking_name">
                        Full Name *
                      </label>
                      <input
                        id="booking_name"
                        name="customer_name"
                        value={bookingForm.customer_name}
                        onChange={handleBookingFormChange}
                        required
                        placeholder="Your full name"
                        className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="booking_people">
                        Number of People *
                      </label>
                      <input
                        id="booking_people"
                        name="num_people"
                        type="number"
                        min="1"
                        max="100"
                        value={bookingForm.num_people}
                        onChange={handleBookingFormChange}
                        required
                        placeholder="1"
                        className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="booking_whatsapp">
                        WhatsApp Number *
                      </label>
                      <input
                        id="booking_whatsapp"
                        name="whatsapp"
                        type="tel"
                        value={bookingForm.whatsapp}
                        onChange={handleBookingFormChange}
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="booking_phone">
                        Phone Number *
                      </label>
                      <input
                        id="booking_phone"
                        name="phone"
                        type="tel"
                        value={bookingForm.phone}
                        onChange={handleBookingFormChange}
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="booking_email">
                        Email *
                      </label>
                      <input
                        id="booking_email"
                        name="email"
                        type="email"
                        value={bookingForm.email}
                        onChange={handleBookingFormChange}
                        required
                        placeholder="your@email.com"
                        className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="rounded-full border border-burgundy-200 px-6 py-3 text-sm font-medium text-burgundy-700 transition hover:bg-burgundy-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!canProceed(2)}
                      className="flex-1 rounded-full bg-burgundy-800 py-3 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue to Terms →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Terms & Conditions ── */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in-0 duration-300">
                  <div>
                    <h2 className="font-serif text-2xl text-burgundy-900 mb-1">Terms & Conditions</h2>
                    <p className="text-sm text-burgundy-500">Please review and accept our booking terms</p>
                  </div>

                  <div className="rounded-2xl border border-burgundy-100 bg-white p-5 space-y-3 max-h-72 overflow-y-auto">
                    {TERMS_AND_CONDITIONS.map((term, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-burgundy-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-burgundy-50 text-[10px] font-bold text-burgundy-500">
                          {i + 1}
                        </span>
                        <p className="leading-relaxed">{term}</p>
                      </div>
                    ))}
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border-2 border-burgundy-100 bg-burgundy-50/40 p-4 cursor-pointer transition hover:border-burgundy-200">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-burgundy-300 text-burgundy-800 focus:ring-burgundy-300"
                    />
                    <span className="text-sm text-burgundy-800 font-medium">
                      I have read and agree to the Terms & Conditions, including the cancellation and refund policy.
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="rounded-full border border-burgundy-200 px-6 py-3 text-sm font-medium text-burgundy-700 transition hover:bg-burgundy-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={!canProceed(3)}
                      className="flex-1 rounded-full bg-burgundy-800 py-3 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Proceed to Payment →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 4: Payment ── */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in-0 duration-300">
                  <div>
                    <h2 className="font-serif text-2xl text-burgundy-900 mb-1">Confirm & Pay</h2>
                    <p className="text-sm text-burgundy-500">Review your booking and complete payment</p>
                  </div>

                  {/* Booking summary */}
                  <div className="rounded-2xl border border-burgundy-100 bg-white p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-burgundy-400">Date</span>
                        <p className="mt-1 font-medium text-burgundy-900">
                          {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-burgundy-400">Time Slot</span>
                        <p className="mt-1 font-medium text-burgundy-900">{slotLabel}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-burgundy-400">Guests</span>
                        <p className="mt-1 font-medium text-burgundy-900">{bookingForm.num_people} people</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-burgundy-400">Contact</span>
                        <p className="mt-1 font-medium text-burgundy-900">{bookingForm.customer_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {errorMsg && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(3)}
                      className="rounded-full border border-burgundy-200 px-6 py-3 text-sm font-medium text-burgundy-700 transition hover:bg-burgundy-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleBookingCheckout}
                      disabled={loading}
                      className="group relative flex-1 overflow-hidden rounded-full bg-burgundy-800 py-3.5 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Processing…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Pay ₹{finalBookingTotal.toLocaleString('en-IN')} securely
                        </span>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-xs text-burgundy-400">
                    🔒 Your payment is 256-bit SSL encrypted via Razorpay
                  </p>
                </div>
              )}
            </div>

            {/* ── Sidebar: Order Summary ── */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-burgundy-100 bg-burgundy-50/50 p-6 sticky top-24">
                <h2 className="mb-4 font-serif text-xl text-burgundy-900">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  {/* Product */}
                  <div className="flex justify-between">
                    <span className="text-burgundy-700">{bookingProduct.name}</span>
                    <span className="font-medium text-burgundy-900 tabular-nums">₹{(bookingProduct.price || 0).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Date & Time */}
                  {selectedDate && (
                    <div className="flex items-center gap-2 rounded-xl bg-white border border-burgundy-100 px-3 py-2">
                      <Calendar className="h-3.5 w-3.5 text-burgundy-500" />
                      <span className="text-xs text-burgundy-600">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {slotLabel && ` · ${slotLabel}`}
                      </span>
                    </div>
                  )}

                  {/* Addons */}
                  {selectedAddons.size > 0 && (
                    <>
                      <div className="border-t border-burgundy-100 pt-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-burgundy-400">Add-ons</span>
                      </div>
                      {ADDONS.filter(a => selectedAddons.has(a.id)).map(addon => (
                        <div key={addon.id} className="flex justify-between">
                          <span className="text-burgundy-600">{addon.emoji} {addon.name}</span>
                          <span className="font-medium text-burgundy-900 tabular-nums">₹{addon.price.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Total */}
                  <div className="mt-4 border-t border-burgundy-200 pt-4 flex justify-between">
                    <span className="font-medium text-burgundy-900">Total</span>
                    <span className="font-serif text-xl text-burgundy-950 tabular-nums">
                      ₹{finalBookingTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Razorpay badge */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-burgundy-100 bg-white py-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[11px] text-burgundy-400">Secured by Razorpay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  // ── RENDER: Regular Cart Checkout (unchanged) ──────────────
  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-burgundy-100 bg-gradient-to-br from-burgundy-50 to-rose-50/60 py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <ScrollReveal>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-burgundy-400">Almost there</p>
            <h1 className="font-serif text-5xl text-burgundy-950">Checkout</h1>
            {/* Secure payment badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5">
              <ShieldCheck className="h-4 w-4 text-green-600" strokeWidth={2} />
              <span className="text-xs font-medium text-green-700">Secured by Razorpay</span>
              <Lock className="h-3 w-3 text-green-500" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="grid gap-8 lg:grid-cols-5">

          {/* Form */}
          <form onSubmit={handleRegularCheckout} className="lg:col-span-3 space-y-5">
            <h2 className="font-serif text-2xl text-burgundy-900">Your details</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="customer_name">
                  Full Name *
                </label>
                <input
                  id="customer_name"
                  name="customer_name"
                  value={regularForm.customer_name}
                  onChange={handleRegularFormChange}
                  required
                  placeholder="Your full name"
                  className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="email">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={regularForm.email}
                  onChange={handleRegularFormChange}
                  required
                  placeholder="your@email.com"
                  className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="phone">
                  Phone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={regularForm.phone}
                  onChange={handleRegularFormChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="street_address">
                  Delivery Address / Street *
                </label>
                <input
                  id="street_address"
                  name="street_address"
                  type="text"
                  value={regularForm.street_address}
                  onChange={handleRegularFormChange}
                  required
                  placeholder="House/Flat No., Building, Street Name"
                  className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="area">
                    Area / Sector *
                  </label>
                  <input
                    id="area"
                    name="area"
                    type="text"
                    value={regularForm.area}
                    onChange={handleRegularFormChange}
                    required
                    placeholder="Sector, Colony, Area"
                    className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="city">
                    City / Town *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={regularForm.city}
                    onChange={handleRegularFormChange}
                    required
                    placeholder="City Name"
                    className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="nearby">
                    Near by (Landmark)
                  </label>
                  <input
                    id="nearby"
                    name="nearby"
                    type="text"
                    value={regularForm.nearby}
                    onChange={handleRegularFormChange}
                    placeholder="Nearby famous place"
                    className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="pin_code">
                    PIN Code *
                  </label>
                  <input
                    id="pin_code"
                    name="pin_code"
                    type="text"
                    pattern="[0-9]{6}"
                    value={regularForm.pin_code}
                    onChange={handleRegularFormChange}
                    required
                    placeholder="6-digit ZIP/PIN Code"
                    className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="district">
                    District *
                  </label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    value={regularForm.district}
                    disabled
                    className="w-full rounded-2xl border border-burgundy-200 bg-burgundy-50/50 px-4 py-3 text-burgundy-900 opacity-80 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="state">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={regularForm.state}
                    disabled
                    className="w-full rounded-2xl border border-burgundy-200 bg-burgundy-50/50 px-4 py-3 text-burgundy-900 opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Pay button */}
            <button
              type="submit"
              id="checkout-pay-btn"
              disabled={loading || cart.length === 0}
              className="group relative w-full overflow-hidden rounded-full bg-burgundy-800 py-4 text-base font-medium text-white transition hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{total.toLocaleString('en-IN')} securely
                </span>
              )}
            </button>

            <p className="text-center text-xs text-burgundy-400">
              🔒 Your payment is 256-bit SSL encrypted via Razorpay
            </p>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-burgundy-100 bg-burgundy-50/50 p-6 sticky top-24">
              <h2 className="mb-4 font-serif text-xl text-burgundy-900">Order Summary</h2>
              {cart.length === 0 ? (
                <p className="text-sm text-burgundy-400">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="space-y-3">
                    {cart.map(item => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-burgundy-700">
                          {item.name}
                          <span className="ml-1 text-burgundy-400">× {item.qty}</span>
                        </span>
                        <span className="font-medium text-burgundy-900 tabular-nums">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-burgundy-200 pt-4 flex justify-between">
                    <span className="font-medium text-burgundy-900">Total</span>
                    <span className="font-serif text-xl text-burgundy-950 tabular-nums">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {/* Razorpay badge */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-burgundy-100 bg-white py-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[11px] text-burgundy-400">Secured by Razorpay</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
