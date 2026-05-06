import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type Order = {
  id: string
  customer_name: string
  email: string
  phone: string
  address: string
  products: Array<{ id: string; name: string; price: number; qty: number; image_url?: string }>
  total: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  order_status: 'processing' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled'
  razorpay_payment_id: string | null
  notes: string | null
  created_at: string
}

export function useOrders(searchQuery?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (searchQuery && searchQuery.trim()) {
      query = query.or(
        `customer_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
      )
    }

    const { data, error } = await query
    if (error) setError(error.message)
    else setOrders((data ?? []) as Order[])
    setLoading(false)
  }, [searchQuery])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateOrderStatus = async (
    orderId: string,
    updates: Partial<Pick<Order, 'order_status' | 'payment_status' | 'notes'>>
  ) => {
    if (!supabase) return { error: 'Supabase not configured' }
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
    if (!error) await fetchOrders()
    return { error: error?.message ?? null }
  }

  const getOrderStats = () => {
    const total = orders.length
    const paid = orders.filter(o => o.payment_status === 'paid').length
    const pending = orders.filter(o => o.payment_status === 'pending').length
    const revenue = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + Number(o.total), 0)
    return { total, paid, pending, revenue }
  }

  return { orders, loading, error, refetch: fetchOrders, updateOrderStatus, getOrderStats }
}
