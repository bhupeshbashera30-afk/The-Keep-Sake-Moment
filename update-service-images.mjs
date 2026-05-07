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

  const { data: services } = await supabase.from('services').select('*')
  let updatedCount = 0

  if (services) {
    for (const s of services) {
      if (!s.hero_image && !s.image_url) {
        let sampleImg = 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop'
        
        if (s.category_id === 1) sampleImg = 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=600&auto=format&fit=crop'
        if (s.category_id === 2) sampleImg = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'
        if (s.category_id === 3) sampleImg = 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600&auto=format&fit=crop'
        if (s.category_id === 4) sampleImg = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop'

        await supabase.from('services').update({ hero_image: sampleImg, image_url: sampleImg }).eq('id', s.id)
        console.log(`Updated service: ${s.name}`)
        updatedCount++
      }
    }
  }

  console.log(`Done. Updated ${updatedCount} services.`)
}

run()
