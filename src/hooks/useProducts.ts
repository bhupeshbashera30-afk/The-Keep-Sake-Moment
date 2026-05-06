import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  created_at: string
}

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (category && category !== 'all') query = query.eq('category', category)
    query.then(({ data, error }) => {
      if (error) setError(error.message)
      else setProducts(data ?? [])
      setLoading(false)
    })
  }, [category])

  return { products, loading, error, refetch: () => {} }
}

export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  return { products, loading, refetch: fetch }
}
