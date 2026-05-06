import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = url && anonKey ? createClient(url, anonKey) : null

// ── Service types ──────────────────────────────────────────
export type ServiceRecord = {
  id: number
  name: string
  slug: string
  category_id: number
  short_description: string
  full_description: string
  hero_image: string | null
  gallery_images: string[] | null
  starting_price: number | null
  price_model: string | null
  is_featured: boolean
  sort_order: number
  is_active: boolean
  pricing_type: 'fixed' | 'custom' | null
  price: number | null
  currency: string | null
  accept_payment: boolean
  payment_type: 'full' | 'advance' | 'inquiry' | null
  advance_amount: number | null
  image_url: string | null
  created_at: string
}

// ── Commerce types ─────────────────────────────────────────
export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string
  stock: number
  is_active: boolean
  created_at: string
}

export type Order = {
  id: string
  customer_name: string
  email: string
  phone: string
  address: string | null
  products: Array<{ id: string; name: string; price: number; qty: number; image_url?: string }>
  total: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  order_status: 'processing' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled'
  razorpay_payment_id: string | null
  created_at: string
}

export type Profile = {
  id: string
  email: string | null
  role: 'admin' | 'user'
  created_at: string
}