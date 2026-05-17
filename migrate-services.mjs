import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=')
  if (key && value) {
    env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '')
  }
})

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY'])

async function run() {
  const { data: services, error: err1 } = await supabase.from('services').select('*')
  if (err1) { console.error(err1); return }
  
  console.log('Found', services.length, 'services to migrate.')

  for (const s of services) {
    let category = ''
    if (s.category_id === 1) category = 'photobooth-rental'
    if (s.category_id === 2) category = 'flowers' // Wait, hampes-and-flower was 2, but flower is now 'flowers' and hampers is 'hampers'
    if (s.category_id === 3) category = 'dinner-night'
    if (s.category_id === 4) category = 'event-and-decor'
    if (s.category_id === 5) category = 'ice-cream-rental'
    if (s.category_id === 6) category = 'crochets'
    
    if (s.category_id === 2) category = 'flowers' // we will just put them in flowers for now or hampers

    const product = {
      name: s.name,
      description: s.short_description,
      price: s.starting_price || 0,
      image_url: s.hero_image || s.image_url,
      category: category,
      stock: 100,
      is_active: s.is_active
    }
    
    const { error: err2 } = await supabase.from('products').insert(product)
    if (err2) {
      console.error('Failed to insert', product.name, err2)
    } else {
      console.log('Inserted', product.name)
      await supabase.from('services').delete().eq('id', s.id)
      console.log('Deleted from services', s.name)
    }
  }
}

run()
