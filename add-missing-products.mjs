import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const newProducts = [
  {
    name: 'Classic Ice Cream Cart',
    description: 'A beautifully restored classic ice cream cart perfect for weddings and parties.',
    price: 150.00,
    image_url: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&q=80',
    category: 'ice_cream_rental',
    stock: 2,
    is_active: true
  },
  {
    name: 'Vintage Ice Cream Van',
    description: 'Full service vintage ice cream van with attendant. Includes 100 servings.',
    price: 350.00,
    image_url: 'https://images.unsplash.com/photo-1515037024463-2a1cb1db4e1e?auto=format&fit=crop&q=80',
    category: 'ice_cream_rental',
    stock: 1,
    is_active: true
  },
  {
    name: 'Crochet Teddy Bear',
    description: 'Handmade amigurumi crochet teddy bear, customizable colors.',
    price: 45.00,
    image_url: 'https://images.unsplash.com/photo-1551608677-761e0172fb1c?auto=format&fit=crop&q=80',
    category: 'crochets',
    stock: 10,
    is_active: true
  },
  {
    name: 'Crochet Flower Bouquet',
    description: 'Beautiful everlasting crochet flower bouquet. Perfect gift.',
    price: 65.00,
    image_url: 'https://images.unsplash.com/photo-1601618608886-f6ab091387d7?auto=format&fit=crop&q=80',
    category: 'crochets',
    stock: 5,
    is_active: true
  }
]

async function addProducts() {
  console.log('Adding products for new categories...')
  const { data, error } = await supabase
    .from('products')
    .insert(newProducts)
    .select()

  if (error) {
    console.error('Error inserting products:', error)
  } else {
    console.log('Successfully added products:', data.length)
  }
}

addProducts()
