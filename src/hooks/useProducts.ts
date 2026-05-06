import { useCallback, useEffect, useState } from 'react'
import { supabase, type Product } from '../lib/supabase'

export type { Product }

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (category) query = query.eq('category', category)
    const { data } = await query
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }, [category])

  useEffect(() => { fetch() }, [fetch])

  return { products, loading, refetch: fetch }
}

// Admin hook — fetches ALL products regardless of is_active
export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { products, loading, refetch }
}