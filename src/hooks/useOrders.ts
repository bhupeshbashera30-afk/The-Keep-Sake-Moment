import { useCallback, useEffect, useState } from 'react'
import { supabase, type Order } from '../lib/supabase'

export type { Order }

export function useOrders(search?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (search && search.trim()) {
      query = query.or(
        `customer_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    const { data } = await query
    const shopOrders = (data as Order[] ?? []).filter(
      order => !order.address?.startsWith('Booking:')
    )
    setOrders(shopOrders)
    setLoading(false)
  }, [search])

  useEffect(() => { refetch() }, [refetch])

  const updateOrderStatus = async (
    id: string,
    updates: Partial<Pick<Order, 'order_status' | 'payment_status'>>
  ) => {
    if (!supabase) return
    await supabase.from('orders').update(updates).eq('id', id)
    await refetch()
  }

  return { orders, loading, refetch, updateOrderStatus }
}