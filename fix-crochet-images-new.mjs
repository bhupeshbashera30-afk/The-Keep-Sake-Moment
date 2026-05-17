import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

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
  await supabase.from('products').update({ image_url: 'https://images.unsplash.com/photo-1605273578330-81f7273cf325?q=80&w=600&auto=format&fit=crop' }).eq('name', 'Crochet Event Favours (Set of 10)')
  await supabase.from('products').update({ image_url: 'https://images.unsplash.com/photo-1616428789617-6409890edcc4?q=80&w=600&auto=format&fit=crop' }).eq('name', 'Amigurumi Keepsake')
  await supabase.from('products').update({ image_url: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=600&auto=format&fit=crop' }).eq('name', 'Crochet Flower Bouquet')
  await supabase.from('products').update({ image_url: 'https://images.unsplash.com/photo-1594918712349-14a055373aab?q=80&w=600&auto=format&fit=crop' }).eq('name', 'Crochet Table Centrepiece')
  console.log('Fixed crochet images')
}
run()
