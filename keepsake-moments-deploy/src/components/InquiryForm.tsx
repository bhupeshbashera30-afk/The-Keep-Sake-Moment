import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'
const serviceOptions = ['Photobooth Rental','Hampers & Flower','Dinner Night','Event & Decor','Birthday','Anniversary','Proposal','Corporate Event','Special Occasion','Packages']
export function InquiryForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      full_name: String(formData.get('full_name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      service_interest: String(formData.get('service_interest') || ''),
      event_date: String(formData.get('event_date') || ''),
      event_location: String(formData.get('event_location') || ''),
      budget_range: String(formData.get('budget_range') || ''),
      guest_count: Number(formData.get('guest_count') || 0),
      notes: String(formData.get('notes') || ''),
    }
    if (!supabase) { setStatus('success'); form.reset(); return }
    try {
      setStatus('loading')
      const { error } = await supabase.from('booking_requests').insert(payload)
      if (error) throw error
      setStatus('success')
      form.reset()
    } catch { setStatus('error') }
  }
  return (
    <form onSubmit={handleSubmit} className={`rounded-[2rem] border border-burgundy-100 bg-white p-6 shadow-soft md:p-8 ${compact ? '' : 'lg:p-10'}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-burgundy-700">Full Name<input name="full_name" required className="w-full rounded-2xl border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400" /></label>
        <label className="space-y-2 text-sm text-burgundy-700">Email<input type="email" name="email" required className="w-full rounded-2xl border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400" /></label>
        <label className="space-y-2 text-sm text-burgundy-700">Phone<input name="phone" required className="w-full rounded-2xl border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400" /></label>
        <label className="space-y-2 text-sm text-burgundy-700">Service Needed<select name="service_interest" required className="w-full rounded-2xl border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400"><option value="">Choose a service</option>{serviceOptions.map((option) => (<option key={option} value={option}>{option}</option>))}</select></label>
        <label className="space-y-2 text-sm text-burgundy-700">Event Date<input type="date" name="event_date" className="w-full rounded-2xl border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400" /></label>
        <label className="space-y-2 text-sm text-burgundy-700">Event Location<input name="event_location" className="w-full rounded-2xl border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400" /></label>
        <label className="space-y-2 text-sm text-burgundy-700">Budget Range<input name="budget_range" placeholder="₹10,000 - ₹25,000" className="w-full rounded-2xl border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400" /></label>
        <label className="space-y-2 text-sm text-burgundy-700">Guest Count<input type="number" min="1" name="guest_count" className="w-full rounded-2xl border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400" /></label>
      </div>
      <label className="mt-4 block space-y-2 text-sm text-burgundy-700">Notes<textarea name="notes" rows={5} className="w-full rounded-[1.5rem] border border-burgundy-200 bg-parchment px-4 py-3 outline-none transition focus:border-burgundy-400" placeholder="Tell us about the occasion, styling ideas, or package preference." /></label>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button type="submit" className="rounded-full bg-burgundy-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:opacity-70" disabled={status === 'loading'}>{status === 'loading' ? 'Sending enquiry...' : 'Send enquiry'}</button>
        <p className="text-sm text-burgundy-600">{status === 'success' && 'Your enquiry has been captured. The team can now reach out with details.'}{status === 'error' && 'Something went wrong. Please try again.'}{status === 'idle' && 'For custom services, pricing is finalized after consultation.'}</p>
      </div>
    </form>
  )
}
