import { useCallback, useEffect, useState } from 'react'
import { supabase, type Product } from '../lib/supabase'

export type { Product }

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    console.log('[useProducts] fetch called with category:', category)
    if (!supabase) { 
      console.log('[useProducts] supabase client is null!')
      setLoading(false); 
      return 
    }
    setLoading(true)
    console.log('[useProducts] calling supabase.from(products)...')
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (category) query = query.eq('category', category)
      
      console.log('[useProducts] awaiting query...')
      const response = await query
      console.log('[useProducts] query response:', response)
      
      setProducts((response.data as Product[]) ?? [])
    } catch (err) {
      console.error('[useProducts] CAUGHT EXCEPTION:', err)
    } finally {
      console.log('[useProducts] setting loading false')
      setLoading(false)
    }
  }, [category])

  useEffect(() => { 
    console.log('[useProducts] useEffect mounting')
    fetch() 
  }, [fetch])

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