import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CreditCard, Lock } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

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

export function CheckoutPage() {
  const { cart, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMsg(null)
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart.length || !supabase) return
    setLoading(true)
    setErrorMsg(null)

    try {
      // ── STEP 1: Create a pending order in our database ────────────────────
      // Use insert + select('id') to get the new order's ID
      const { data: insertedRows, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.customer_name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          products: cart,
          total,
          payment_status: 'pending',
          order_status: 'processing',
        })
        .select('id')

      if (orderError) {
        console.error('Order insert error:', orderError)
        throw new Error(`Order failed: ${orderError.message}`)
      }

      if (!insertedRows || insertedRows.length === 0) {
        throw new Error('Order created but could not retrieve ID. Please try again.')
      }

      const orderId = insertedRows[0].id

      // ── STEP 2: Create a Razorpay order via Edge Function ────────────────
      // This keeps the Key Secret on the server — never in the browser
      let razorpay_order_id: string

      if (RAZORPAY_KEY_ID) {
        const rzpOrder = await callEdgeFunction('create-razorpay-order', {
          amount: total,
          currency: 'INR',
          order_db_id: orderId,
        })
        razorpay_order_id = rzpOrder.razorpay_order_id
      } else {
        // Dev/demo mode: skip Razorpay, mark paid directly
        await supabase
          .from('orders')
          .update({ payment_status: 'paid', order_status: 'confirmed' })
          .eq('id', orderId)
        clearCart()
        navigate('/order-success?id=' + orderId)
        setLoading(false)
        return
      }

      // ── STEP 3: Open Razorpay payment modal in the browser ───────────────
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Keepsake Moments',
        description: 'Event gifts & keepsakes',
        order_id: razorpay_order_id, // The Razorpay-generated order ID (required for signature verification)
        prefill: {
          name: form.customer_name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#6b1e2f' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setErrorMsg('Payment was cancelled. Your cart is saved — try again when ready.')
          },
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            // ── STEP 4: Verify payment signature via Edge Function ──────────
            // This is the critical security step — the server checks the signature
            // using the Key Secret to confirm the payment is genuine
            await callEdgeFunction('verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_db_id: orderId,
            })

            // ── STEP 5: Payment verified → success ──────────────────────────
            clearCart()
            navigate('/order-success?id=' + orderId)
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr)
            setErrorMsg(
              'Payment was received but verification failed. Please contact us with your payment ID: ' +
              response.razorpay_payment_id
            )
            setLoading(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error)
        setErrorMsg(
          `Payment failed: ${response.error.description || 'Please try again.'}`
        )
        setLoading(false)
      })

      rzp.open()
      // Note: setLoading(false) is NOT called here because the modal is still open.
      // It's called only on modal dismiss or in the handler/failure callbacks above.

    } catch (err: any) {
      console.error('Checkout error:', err)
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

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
          <form onSubmit={handleCheckout} className="lg:col-span-3 space-y-5">
            <h2 className="font-serif text-2xl text-burgundy-900">Your details</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="customer_name">
                  Full Name *
                </label>
                <input
                  id="customer_name"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
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
                  value={form.email}
                  onChange={handleChange}
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
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="address">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Street, City, State, PIN"
                  className="w-full rounded-2xl border border-burgundy-200 bg-white px-4 py-3 text-burgundy-900 placeholder:text-burgundy-300 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
                />
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
