import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixChocolateImage() {
  const { data, error } = await supabase
    .from('products')
    .update({ image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80' })
    .eq('name', 'Premium Chocolate Assortment')

  if (error) {
    console.error('Error updating chocolate image:', error)
  } else {
    console.log('Successfully updated chocolate image')
  }
}

fixChocolateImage()
