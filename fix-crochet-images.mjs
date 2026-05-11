import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixCrochetImages() {
  const { data, error } = await supabase
    .from('products')
    .update({ image_url: '/images/crochets-category.png' })
    .eq('category', 'crochets')

  if (error) {
    console.error('Error updating images:', error)
  } else {
    console.log('Successfully updated crochet images to local file')
  }
}

fixCrochetImages()
