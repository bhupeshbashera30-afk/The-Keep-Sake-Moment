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
  const updates = [
    { name: 'Elegant Birthday Setup', cat: 'birthday' },
    { name: 'Silver Jubilee Anniversary Setup', cat: 'anniversary' },
    { name: 'Marry Me Light-Up Letters Proposal', cat: 'proposal' },
    { name: 'Corporate Brand Launch Setup', cat: 'corporate' },
    { name: 'Birthday Decor', cat: 'birthday' },
    { name: 'Anniversary Decor', cat: 'anniversary' },
    { name: 'Proposal Setup', cat: 'proposal' },
    { name: 'Corporate Event', cat: 'corporate' },
    { name: 'Special Occasion', cat: 'special-occasion' },
  ]

  for (const u of updates) {
    const { error } = await supabase.from('products').update({ category: u.cat }).eq('name', u.name)
    if (error) console.error(error)
    else console.log('Updated', u.name, 'to', u.cat)
  }
}

run()
