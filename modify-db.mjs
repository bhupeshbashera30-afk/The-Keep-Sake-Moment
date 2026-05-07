import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjrwpulvystjkcfeldpk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
  // Sign in
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@keepsake.com',
    password: 'Admin@123'
  })
  if (authError) {
    console.error('Sign in failed:', authError.message)
    return
  }

  // 1. Delete all category_id = 1 services
  const { error: delError } = await supabase.from('services').delete().eq('category_id', 1)
  if (delError) console.error('Error deleting:', delError)
  else console.log('Deleted all photobooth services.')

  // 2. Insert single Photobooth Rental service with an image
  const photoboothService = {
    name: 'Photobooth Rental',
    slug: 'photobooth-rental',
    category_id: 1,
    short_description: 'Elegant booth styling for all occasions.',
    full_description: 'An elegant photobooth rental for any event, capturing memories with premium styling.',
    hero_image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=600&auto=format&fit=crop',
    starting_price: 15000,
    price_model: 'Starting from',
    is_active: true,
    sort_order: 1
  }
  const { error: insertError } = await supabase.from('services').insert([photoboothService])
  if (insertError) console.error('Error inserting:', insertError)
  else console.log('Inserted single Photobooth service with image.')

  // 3. Find products with no image and add a sample image
  const { data: products } = await supabase.from('products').select('*')
  if (products) {
    for (const p of products) {
      if (!p.image_url) {
        let sampleImg = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'
        // change image based on category
        if (p.category === 'hampers') sampleImg = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'
        if (p.category === 'flowers') sampleImg = 'https://images.unsplash.com/photo-1563241598-a241285db24e?q=80&w=600&auto=format&fit=crop'
        if (p.category === 'addons') sampleImg = 'https://images.unsplash.com/photo-1555529733-0e67056058ab?q=80&w=600&auto=format&fit=crop'
        
        await supabase.from('products').update({ image_url: sampleImg }).eq('id', p.id)
        console.log(`Updated product ${p.name} with image.`)
      }
    }
  }

  console.log('Done.')
}

run()
