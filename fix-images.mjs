import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjrwpulvystjkcfeldpk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// A collection of beautiful, working, high-quality unsplash images for different event types.
const images = {
  'Birthday Decor': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
  'Kids Themed Birthday Decor': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop',
  'Romantic Anniversary Suite Styling': 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop',
  'Anniversary Decor': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop',
  'Floral Archway Proposal': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop',
  'Proposal Setup': 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
  'Corporate Event': 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
  'Special Occasion': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=600&auto=format&fit=crop',
  'Intimate Candlelight Dinner': 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600&auto=format&fit=crop',
  'Dinner Night': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600&auto=format&fit=crop',
  'Premium Rooftop Dining Experience': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  'Boho Picnic Setup': 'https://images.unsplash.com/photo-1533619043865-1c2e1f42d8b7?q=80&w=600&auto=format&fit=crop',
}

const productImages = {
  'Premium Chocolate Assortment': 'https://images.unsplash.com/photo-1548883354-94bc0ecf0f09?q=80&w=600&auto=format&fit=crop',
  'Luxury Rose Hamper': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop',
  'Personalised Memory Box': 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop',
  // fallback for products
  'fallback': 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600&auto=format&fit=crop'
}

async function run() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@keepsake.com',
    password: 'Admin@123'
  })

  if (authError) {
    console.error('Sign in failed:', authError.message)
    return
  }

  // Update Services
  const { data: services } = await supabase.from('services').select('*')
  if (services) {
    for (const s of services) {
      if (images[s.name]) {
        await supabase.from('services').update({ hero_image: images[s.name], image_url: images[s.name] }).eq('id', s.id)
        console.log(`Updated service: ${s.name}`)
      }
    }
  }

  // Update Products
  const { data: products } = await supabase.from('products').select('*')
  if (products) {
    for (const p of products) {
      if (productImages[p.name] || p.image_url?.includes('1548883354-94bc0ecf0f09')) {
        const img = productImages[p.name] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'
        await supabase.from('products').update({ image_url: img }).eq('id', p.id)
        console.log(`Updated product: ${p.name}`)
      }
    }
  }

  console.log('Done updating images.')
}

run()
