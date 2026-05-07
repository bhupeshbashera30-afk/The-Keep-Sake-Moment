import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScrollReveal } from '../components/ScrollReveal'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

declare global {
  interface Window { Razorpay: any }
}

export function CheckoutPage() {
  const { cart, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart.length || !supabase) return
    setLoading(true)

    const orderPayload = {
      ...form,
      products: cart,
      total,
      payment_status: 'pending',
      order_status: 'processing',
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single()

    if (error || !order) {
      alert('Failed to create order. Please try again.')
      setLoading(false)
      return
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      // Dev mode: mark as paid directly without Razorpay
      await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', order.id)
      clearCart()
      navigate('/order-success?id=' + order.id)
      setLoading(false)
      return
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(total * 100),
      currency: 'INR',
      name: 'Keepsake Moments',
      description: 'Event gifts & add-ons',
      image: '/logo.png',
      handler: async (response: any) => {
        if (!supabase) return
        await supabase.from('orders').update({
          razorpay_payment_id: response.razorpay_payment_id,
          payment_status: 'paid',
          order_status: 'confirmed',
        }).eq('id', order.id)

        const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'order.paid',
              order_id: order.id,
              customer_name: form.customer_name,
              email: form.email,
              phone: form.phone,
              total,
              products: cart.map(i => `${i.name} x${i.qty}`).join(', '),
            }),
          }).catch(() => {})
        }

        clearCart()
        navigate('/order-success?id=' + order.id)
      },
      prefill: {
        name: form.customer_name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: '#6b1e2f' },
      modal: { ondismiss: () => setLoading(false) },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
    setLoading(false)
  }

  return (
    <>
      <section className="relative border-b border-burgundy-100 bg-gradient-to-br from-burgundy-50 to-rose-50/60 py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <ScrollReveal>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-burgundy-400">Almost there</p>
            <h1 className="font-serif text-5xl text-burgundy-950">Checkout</h1>
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
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="customer_name">Full Name *</label>
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
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="email">Email *</label>
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
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="phone">Phone *</label>
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
                <label className="mb-1.5 block text-sm text-burgundy-600" htmlFor="address">Delivery Address</label>
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

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full rounded-full bg-burgundy-800 py-4 text-base font-medium text-white transition hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Processing…' : `Pay ₹${total.toLocaleString('en-IN')}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-burgundy-100 bg-burgundy-50/50 p-6">
              <h2 className="mb-4 font-serif text-xl text-burgundy-900">Order Summary</h2>
              {cart.length === 0 ? (
                <p className="text-sm text-burgundy-400">Your cart is empty.</p>
              ) : (
                <ul className="space-y-3">
                  {cart.map(item => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-burgundy-700">{item.name} × {item.qty}</span>
                      <span className="font-medium text-burgundy-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </li>
                  ))}
                  <li className="border-t border-burgundy-200 pt-3 flex justify-between">
                    <span className="font-medium text-burgundy-900">Total</span>
                    <span className="font-serif text-xl text-burgundy-950">₹{total.toLocaleString('en-IN')}</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
