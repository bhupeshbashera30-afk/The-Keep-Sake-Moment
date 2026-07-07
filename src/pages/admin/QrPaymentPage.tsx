import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { generateQRDataURL } from '../../lib/qrcode'
import { QrCode, Search, Loader2, Copy, Check, ExternalLink, Clock, CheckCircle2, AlertCircle, Send, Zap, Trash2 } from 'lucide-react'
import { TIME_SLOTS } from '../../lib/siteConfig'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

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

interface BookingRecord {
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
  created_at: string
  products: { name: string; price: number } | null
}

interface PaymentLink {
  id: string
  booking_id: string | null
  order_id: string | null
  amount: number
  payment_stage: string
  razorpay_link_id: string | null
  razorpay_short_url: string | null
  razorpay_qr_image_url?: string | null
  status: string
  created_at: string
  bookings?: {
    customer_name: string
  } | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function QrPaymentPage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'live_monitor'>('generator')
  const [upiId, setUpiId] = useState(() => localStorage.getItem('keepsake_upi_id') || '')
  const [payeeName, setPayeeName] = useState(() => localStorage.getItem('keepsake_payee_name') || 'Bhupesh Bashera')
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)
  const [paymentStage, setPaymentStage] = useState<'planning' | 'completion' | 'custom'>('planning')
  const [customAmount, setCustomAmount] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<{ id?: string; url: string; qrDataUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingLinks, setExistingLinks] = useState<PaymentLink[]>([])
  const [allPaymentLinks, setAllPaymentLinks] = useState<PaymentLink[]>([])
  const [linksLoading, setLinksLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState<{ amount: number; stage: string } | null>(null)

  const fetchAllLinks = useCallback(async () => {
    if (!supabase) return
    try {
      // Sync payment statuses from Razorpay in the background (fire-and-forget)
      callEdgeFunction('create-payment-link', { action: 'sync' }).catch(console.error)

      const { data, error } = await supabase
        .from('payment_links')
        .select('*, bookings(customer_name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setAllPaymentLinks((data as unknown as PaymentLink[]) || [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
    fetchAllLinks()
  }, [fetchAllLinks])

  // Realtime subscription & polling fallback (every 3 seconds) for absolute reliability
  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('realtime-payment-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_links' }, () => {
        fetchAllLinks()
      })
      .subscribe()

    const interval = setInterval(() => {
      fetchAllLinks()
    }, 3000)
      
    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
      clearInterval(interval)
    }
  }, [fetchAllLinks])

  // Sync current booking links when all links change
  useEffect(() => {
    if (selectedBooking) {
      setExistingLinks(allPaymentLinks.filter(l => l.booking_id === selectedBooking.id))
    }
  }, [allPaymentLinks, selectedBooking])

  // Auto-close QR code and pop up success modal when payment is confirmed
  useEffect(() => {
    if (generatedLink) {
      const activeLink = allPaymentLinks.find(l => l.razorpay_short_url === generatedLink.url)
      if (activeLink && activeLink.status === 'paid') {
        setGeneratedLink(null)
        setShowSuccessModal({
          amount: Number(activeLink.amount),
          stage: activeLink.payment_stage
        })
      }
    }
  }, [allPaymentLinks, generatedLink])

  const fetchBookings = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id,product_id,order_id,booking_date,time_slot,customer_name,email,phone,whatsapp,num_people,addons,addons_total,payment_status,created_at,products(name,price)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setBookings((data as unknown as BookingRecord[]) || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingLinks = useCallback(async (bookingId: string) => {
    if (!supabase) return
    setLinksLoading(true)
    try {
      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setExistingLinks((data as PaymentLink[]) || [])
    } catch {
      setExistingLinks([])
    } finally {
      setLinksLoading(false)
    }
  }, [])

  const handleSelectBooking = (b: BookingRecord) => {
    setSelectedBooking(b)
    setGeneratedLink(null)
    setError(null)
    setPaymentStage('planning')
    setCustomAmount('')
    setExistingLinks(allPaymentLinks.filter(l => l.booking_id === b.id))
  }

  const productPrice = selectedBooking?.products?.price || 0
  const computedAmount = paymentStage === 'planning'
    ? Math.ceil(productPrice * 0.70)
    : paymentStage === 'completion'
      ? productPrice - Math.ceil(productPrice * 0.20) - Math.ceil(productPrice * 0.70)
      : parseFloat(customAmount) || 0

  const handleGenerate = async () => {
    if (!selectedBooking || computedAmount <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    setGenerating(true)
    setError(null)
    setGeneratedLink(null)

    try {
      const stageLabels: Record<string, string> = {
        planning: 'Planning Stage (70%)',
        completion: 'Completion (10%)',
        custom: 'Custom Payment',
      }
      const description = `${stageLabels[paymentStage]} — ${selectedBooking.products?.name || 'Booking'} — ${selectedBooking.customer_name}`

      const result = await callEdgeFunction('create-payment-link', {
        amount: computedAmount,
        customer_name: selectedBooking.customer_name,
        email: selectedBooking.email || '',
        phone: selectedBooking.phone,
        description,
        booking_id: selectedBooking.id,
        order_id: selectedBooking.order_id,
        payment_stage: paymentStage,
      })

      // Generate a direct P2P UPI QR code if UPI ID is configured, otherwise fallback to Razorpay URL QR
      let qrDataUrl = ''
      if (upiId.trim()) {
        const upiUri = `upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(payeeName.trim())}&am=${computedAmount}&cu=INR`
        qrDataUrl = generateQRDataURL(upiUri, 6, 4)
      } else {
        qrDataUrl = result.qr_image_url || generateQRDataURL(result.short_url || '', 6, 4)
      }
      
      setGeneratedLink({ id: result.link_id || result.id || '', url: result.short_url || '', qrDataUrl })

      // Refresh
      fetchAllLinks()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to generate payment link.')
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkAsPaid = async (linkId: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('payment_links')
        .update({ status: 'paid' })
        .eq('id', linkId)
      if (error) throw error
    } catch (err: any) {
      alert(`Error updating payment status: ${err.message}`)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this payment record? This cannot be undone.')) return
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('payment_links')
        .delete()
        .eq('id', linkId)
      if (error) throw error
      fetchAllLinks()
    } catch (err: any) {
      alert(`Error deleting payment record: ${err.message}`)
    }
  }

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = (url: string, amount: number) => {
    const msg = encodeURIComponent(
      `Hi ${selectedBooking?.customer_name || ''},\n\nHere's your payment link for ₹${amount.toLocaleString('en-IN')}:\n${url}\n\nThank you!\n– Keepsake Moments`
    )
    const phone = selectedBooking?.whatsapp || selectedBooking?.phone || ''
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  const filteredBookings = bookings.filter(b =>
    b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    (b.email || '').toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search)
  )

  const slotLabel = selectedBooking
    ? TIME_SLOTS.find(s => s.id === selectedBooking.time_slot)?.label || selectedBooking.time_slot
    : ''

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-burgundy-950 flex items-center gap-2">
            <QrCode className="h-7 w-7 text-burgundy-800" />
            QR Payment Links
          </h1>
          <p className="text-xs text-burgundy-400 mt-1">Generate QR codes and payment links for collecting 70% (planning) or 10% (completion) payments.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-burgundy-100 pb-px">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition-all ${
            activeTab === 'generator'
              ? 'border-burgundy-800 text-burgundy-950 font-bold bg-burgundy-50/30'
              : 'border-transparent text-gray-500 hover:text-burgundy-700'
          }`}
        >
          <QrCode className="h-4 w-4" />
          QR Generator
        </button>
        <button
          onClick={() => setActiveTab('live_monitor')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition-all relative ${
            activeTab === 'live_monitor'
              ? 'border-burgundy-800 text-burgundy-950 font-bold bg-burgundy-50/30'
              : 'border-transparent text-gray-500 hover:text-burgundy-700'
          }`}
        >
          <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
          Live Payments Monitor
          {allPaymentLinks.filter(l => l.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
              {allPaymentLinks.filter(l => l.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'live_monitor' ? (
        <div className="rounded-2xl border border-burgundy-100 bg-white p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-150">
            <div>
              <h2 className="text-sm font-semibold text-burgundy-950 font-serif">Real-time Payment Feed</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Displays payment links from all bookings updating instantly in real-time.</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full font-semibold animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Live Connected
            </span>
          </div>

          <div className="space-y-3">
            {allPaymentLinks.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-16">No payment links generated yet.</p>
            ) : (
              allPaymentLinks.map(link => {
                const isPaid = link.status === 'paid'
                return (
                  <div
                    key={link.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                      isPaid
                        ? 'border-green-100 bg-green-50/10'
                        : 'border-gray-100 bg-gray-50/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-burgundy-950">₹{Number(link.amount).toLocaleString('en-IN')}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                          link.payment_stage === 'planning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          link.payment_stage === 'completion' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {link.payment_stage}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{link.bookings?.customer_name || 'Anonymous'}</p>
                      <p className="text-[9px] text-gray-400">Created: {formatDate(link.created_at)}</p>
                    </div>

                    <div className="flex items-center gap-2.5 mt-3 sm:mt-0">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                        isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700 animate-pulse'
                      }`}>
                        {isPaid ? '✓ Paid' : 'Pending'}
                      </span>

                      {!isPaid && (
                        <button
                          onClick={() => handleMarkAsPaid(link.id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition"
                        >
                          Mark as Paid
                        </button>
                      )}
                      
                      {link.razorpay_short_url && (
                        <button
                          onClick={() => handleCopy(link.razorpay_short_url!)}
                          className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
                          title="Copy Link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 rounded bg-red-50 hover:bg-red-100 text-red-600 transition"
                        title="Delete Payment Link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Booking Selector */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-5 shadow-soft h-fit max-h-[75vh] flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-burgundy-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-2">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : filteredBookings.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-10">No bookings found.</p>
            ) : (
              filteredBookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBooking(b)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedBooking?.id === b.id
                      ? 'border-burgundy-800 bg-burgundy-50/40 shadow-sm'
                      : 'border-gray-100 hover:border-burgundy-200 hover:bg-burgundy-50/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-burgundy-950">{b.customer_name}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">{b.products?.name || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{formatDate(b.booking_date)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Generator Panel */}
        <div className="space-y-5">
          {!selectedBooking ? (
            <div className="rounded-2xl border border-burgundy-100 bg-white shadow-soft flex flex-col items-center justify-center py-24 text-gray-400">
              <QrCode className="h-10 w-10 mb-3 text-gray-300" />
              <p className="text-sm font-medium">Select a booking to generate a payment QR</p>
            </div>
          ) : (
            <>
              {/* Booking Info Card */}
              <div className="rounded-2xl border border-burgundy-100 bg-white shadow-soft p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-burgundy-950">{selectedBooking.customer_name}</h3>
                    <p className="text-xs text-gray-500">{selectedBooking.products?.name || 'Booking'} — {formatDate(selectedBooking.booking_date)} · {slotLabel}</p>
                  </div>
                  <span className="text-xs font-serif font-bold text-burgundy-800">₹{productPrice.toLocaleString('en-IN')}</span>
                </div>

                {/* Payment breakdown summary */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-green-50 border border-green-100 px-2 py-2">
                    <div className="text-[10px] text-green-600 font-medium">Advance (20%)</div>
                    <div className="text-xs font-bold text-green-800 tabular-nums">₹{Math.ceil(productPrice * 0.20).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-100 px-2 py-2">
                    <div className="text-[10px] text-amber-600 font-medium">Planning (70%)</div>
                    <div className="text-xs font-bold text-amber-800 tabular-nums">₹{Math.ceil(productPrice * 0.70).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 px-2 py-2">
                    <div className="text-[10px] text-blue-600 font-medium">Completion (10%)</div>
                    <div className="text-xs font-bold text-blue-800 tabular-nums">₹{(productPrice - Math.ceil(productPrice * 0.20) - Math.ceil(productPrice * 0.70)).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              {/* Stage Selector & Generate */}
              <div className="rounded-2xl border border-burgundy-100 bg-white shadow-soft p-5">
                <div className="grid gap-4 sm:grid-cols-2 mb-5 pb-5 border-b border-gray-150">
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Your UPI ID (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => {
                        setUpiId(e.target.value)
                        localStorage.setItem('keepsake_upi_id', e.target.value)
                      }}
                      placeholder="e.g. bhupesh@okaxis"
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 text-xs outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Verified Payee Name</label>
                    <input
                      type="text"
                      value={payeeName}
                      onChange={e => {
                        setPayeeName(e.target.value)
                        localStorage.setItem('keepsake_payee_name', e.target.value)
                      }}
                      placeholder="e.g. Bhupesh Bashera"
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 text-xs outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
                    />
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-burgundy-800 uppercase tracking-wider mb-3">Select Payment Stage</h4>

                <div className="space-y-2 mb-4">
                  {([
                    { value: 'planning' as const, label: 'Planning Stage — 70%', color: 'text-amber-700', amount: Math.ceil(productPrice * 0.70) },
                    { value: 'completion' as const, label: 'Completion — 10%', color: 'text-blue-700', amount: productPrice - Math.ceil(productPrice * 0.20) - Math.ceil(productPrice * 0.70) },
                    { value: 'custom' as const, label: 'Custom Amount', color: 'text-burgundy-700', amount: null },
                  ] as const).map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentStage === opt.value
                          ? 'border-burgundy-300 bg-burgundy-50/40 shadow-sm'
                          : 'border-gray-100 hover:border-burgundy-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentStage"
                        value={opt.value}
                        checked={paymentStage === opt.value}
                        onChange={() => setPaymentStage(opt.value)}
                        className="accent-burgundy-800"
                      />
                      <span className={`text-xs font-medium ${opt.color}`}>{opt.label}</span>
                      {opt.amount !== null && (
                        <span className="ml-auto text-xs font-bold tabular-nums text-burgundy-900">₹{opt.amount.toLocaleString('en-IN')}</span>
                      )}
                    </label>
                  ))}
                </div>

                {paymentStage === 'custom' && (
                  <div className="mb-4">
                    <label className="text-[10px] text-gray-500 font-medium block mb-1">Enter Amount (₹)</label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      min="1"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
                    />
                  </div>
                )}

                {error && (
                  <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={generating || computedAmount <= 0}
                  className="w-full py-3 bg-burgundy-800 text-white rounded-xl text-xs font-semibold hover:bg-burgundy-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow"
                >
                  {generating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                  ) : (
                    <><QrCode className="h-4 w-4" /> Generate QR for ₹{computedAmount.toLocaleString('en-IN')}</>
                  )}
                </button>
              </div>

              {/* Generated QR Display */}
              {generatedLink && (
                <div className="rounded-2xl border-2 border-burgundy-200 bg-white shadow-soft p-6 text-center animate-fadeIn">
                  <h4 className="text-sm font-semibold text-burgundy-950 mb-4">Payment QR Code</h4>

                  <div className="inline-block p-4 bg-white rounded-2xl border border-gray-200 shadow-sm mb-4">
                    <img src={generatedLink.qrDataUrl} alt="Payment QR Code" className="w-48 h-48" />
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Amount: <span className="font-bold text-burgundy-900">₹{computedAmount.toLocaleString('en-IN')}</span>
                  </p>

                  <div className="flex gap-2 justify-center flex-wrap">
                    <button
                      onClick={() => handleCopy(generatedLink.url)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={generatedLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Link
                    </a>
                    <button
                      onClick={() => handleShareWhatsApp(generatedLink.url, computedAmount)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition"
                    >
                      <Send className="h-3.5 w-3.5" />
                      WhatsApp
                    </button>
                    {generatedLink.id && (
                      <button
                        onClick={async () => {
                          await handleMarkAsPaid(generatedLink.id!)
                          const item = allPaymentLinks.find(l => l.id === generatedLink.id)
                          setGeneratedLink(null)
                          setShowSuccessModal({
                            amount: computedAmount || (item ? Number(item.amount) : 0),
                            stage: item?.payment_stage || paymentStage
                          })
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition shadow-glow"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Existing Payment Links */}
              <div className="rounded-2xl border border-burgundy-100 bg-white shadow-soft p-5">
                <h4 className="text-xs font-semibold text-burgundy-800 uppercase tracking-wider mb-3">Payment Link History</h4>
                {linksLoading ? (
                  <div className="py-6 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /></div>
                ) : existingLinks.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No payment links generated yet for this booking.</p>
                ) : (
                  <div className="space-y-2">
                    {existingLinks.map(link => (
                      <div
                        key={link.id}
                        onClick={() => {
                          if (link.razorpay_short_url) {
                            let qrDataUrl = ''
                            if (upiId.trim()) {
                              const upiUri = `upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(payeeName.trim())}&am=${link.amount}&cu=INR`
                              qrDataUrl = generateQRDataURL(upiUri, 6, 4)
                            } else {
                              qrDataUrl = (link as any).razorpay_qr_image_url || generateQRDataURL(link.razorpay_short_url, 6, 4)
                            }
                            setGeneratedLink({
                              url: link.razorpay_short_url,
                              qrDataUrl
                            })
                          }
                        }}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer hover:border-burgundy-200 hover:bg-burgundy-50/20 transition-all"
                        title="Click to view QR code"
                      >
                        <div className="flex items-center gap-2">
                          {link.status === 'paid' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                          <div>
                            <div className="text-xs font-medium text-gray-800">
                              ₹{Number(link.amount).toLocaleString('en-IN')} — {link.payment_stage}
                            </div>
                            <div className="text-[10px] text-gray-400">{formatDate(link.created_at)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            link.status === 'paid' ? 'bg-green-100 text-green-700' :
                            link.status === 'expired' ? 'bg-gray-100 text-gray-500' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {link.status}
                          </span>
                          {link.razorpay_short_url && (
                            <button
                              onClick={() => handleCopy(link.razorpay_short_url!)}
                              className="p-1 rounded hover:bg-gray-200 transition"
                              title="Copy link"
                            >
                              <Copy className="h-3 w-3 text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 rounded hover:bg-red-100 text-red-500 transition"
                            title="Delete Payment Link"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        </div>
      )}

      {/* Payment Success Popup Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-burgundy-100 shadow-2xl relative animate-scaleUp">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border-4 border-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            
            <h3 className="font-serif text-2xl text-burgundy-950 mb-2">Payment Received!</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              A payment of <span className="font-bold text-burgundy-900">₹{showSuccessModal.amount.toLocaleString('en-IN')}</span> for the <span className="font-semibold text-burgundy-800">{showSuccessModal.stage}</span> stage has been successfully confirmed.
            </p>
            
            <button
              onClick={() => setShowSuccessModal(null)}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition shadow-glow"
            >
              Great, thank you!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
