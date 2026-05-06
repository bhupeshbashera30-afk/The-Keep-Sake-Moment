import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Order = {
  id: string
  customer_name: string
  email: string
  phone: string
  address: string
  products: Array<{ id: string; name: string; price: number; qty: number }>
  total: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  order_status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  razorpay_payment_id: string | null
  razorpay_order_id: string | null
  created_at: string
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  return { orders, loading, refetch: fetch }
}
