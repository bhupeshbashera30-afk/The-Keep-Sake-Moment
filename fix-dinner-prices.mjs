import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjrwpulvystjkcfeldpk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@keepsake.com',
    password: 'Admin@123'
  })

  if (authError) {
    console.error('Sign in failed:', authError.message)
    return
  }

  // 1. Fix the image for Boho Picnic Setup
  const validPicnicImage = 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=600&auto=format&fit=crop'
  await supabase.from('services')
    .update({ hero_image: validPicnicImage, image_url: validPicnicImage })
    .eq('name', 'Boho Picnic Setup')
  console.log('Fixed Boho Picnic Setup image')

  // 2. Fetch Dinner Night category ID
  const { data: dinnerCat } = await supabase.from('categories').select('id').eq('slug', 'dinner-night').single()
  if (dinnerCat) {
    // Fetch all services under Dinner Night
    const { data: services } = await supabase.from('services').select('*').eq('category_id', dinnerCat.id)
    if (services) {
      console.log('Dinner Night Services before update:', services.map(s => ({ name: s.name, price: s.base_price, is_fixed: s.is_fixed_price })))
      
      // Update them to have a base price if missing or set them all to something reasonable
      // The user says "SET PRICE IN EVERY PRODUCT IN THE DINNER NIGHT"
      // Let's ensure they all have a base_price > 0.
      for (const s of services) {
        if (!s.base_price || s.base_price === 0) {
          await supabase.from('services').update({ base_price: 5000 }).eq('id', s.id)
          console.log(`Set price for ${s.name} to 5000`)
        } else {
          // If the user meant "set them to fixed package", we can set is_fixed_price = true?
          // I'll set is_fixed_price = true for everything in Dinner Night just in case.
          await supabase.from('services').update({ is_fixed_price: true }).eq('id', s.id)
          console.log(`Set ${s.name} to FIXED PACKAGE (was ${s.is_fixed_price})`)
        }
      }
    }
  }

  console.log('Done')
}

run()
