import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function removeIceCream() {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('category', 'ice_cream_rental')

  if (error) {
    console.error('Error deleting:', error)
  } else {
    console.log('Successfully deleted ice cream products')
  }
}

removeIceCream()
