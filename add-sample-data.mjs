import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjrwpulvystjkcfeldpk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const sampleProducts = [
  {
    name: 'Luxury Rose Hamper',
    description: 'A curated selection of premium red roses, artisanal chocolates, and a scented candle in a Keepsake Moments signature box.',
    price: 4500,
    category: 'hampers',
    stock: 10,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Classic Baby Breath Bouquet',
    description: 'An elegant, oversized bouquet of fresh baby breath wrapped in premium parchment paper.',
    price: 1800,
    category: 'flowers',
    stock: 25,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Birthday Midnight Surprise',
    description: 'Complete midnight celebration box including a mini cake, party poppers, a custom sash, and a curated gift box.',
    price: 3200,
    category: 'gift_boxes',
    stock: 15,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop' // Reusing placeholder
  },
  {
    name: 'Anniversary Setup Kit',
    description: 'Everything you need for an intimate room setup: 50 foil balloons, 100 tea light candles, and rose petals.',
    price: 2500,
    category: 'celebration',
    stock: 20,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Custom Neon Sign (Rental)',
    description: '"Better Together" or "Happy Birthday" neon sign to add that aesthetic glow to your event backdrop.',
    price: 1500,
    category: 'event_addons',
    stock: 5,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Premium Chocolate Assortment',
    description: 'Handcrafted truffles and dark chocolate squares arranged beautifully, perfect as a standalone gift or add-on.',
    price: 1200,
    category: 'gift_boxes',
    stock: 30,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1548883354-94bc0ecf0f09?q=80&w=600&auto=format&fit=crop'
  }
]

async function run() {
  console.log('Signing in as Admin...')
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@keepsake.com',
    password: 'Admin@123'
  })

  if (authError) {
    console.error('Failed to sign in:', authError.message)
    return
  }
  
  console.log('Successfully signed in. Inserting sample products...')
  
  const { data, error } = await supabase.from('products').insert(sampleProducts).select()
  
  if (error) {
    console.error('Error inserting data:', error.message)
  } else {
    console.log(`✅ Successfully inserted ${data.length} sample products!`)
  }
}

run()
