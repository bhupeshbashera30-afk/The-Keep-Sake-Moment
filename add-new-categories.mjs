import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjrwpulvystjkcfeldpk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
  console.log('Signing in as Admin...')
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@keepsake.com',
    password: 'Admin@123'
  })
  if (authError) { console.error('Failed to sign in:', authError.message); return }
  console.log('Successfully signed in.\n')

  // ──────────────────────────────────────────────────────────
  // STEP 1: Insert new categories into `categories` table
  // ──────────────────────────────────────────────────────────
  console.log('STEP 1: Inserting new categories...')
  const { data: newCats, error: catErr } = await supabase
    .from('categories')
    .insert([
      {
        id: 5,
        name: 'Ice Cream Rental',
        slug: 'ice-cream-rental',
        description: 'Premium ice cream cart and sundae bar rentals for events, parties, and celebrations.',
        sort_order: 5,
        is_active: true,
      },
      {
        id: 6,
        name: 'Crochets',
        slug: 'crochets',
        description: 'Handcrafted crochet keepsakes, bouquets, and decorative pieces for gifting and events.',
        sort_order: 6,
        is_active: true,
      },
    ])
    .select()

  if (catErr) {
    console.error('Error inserting categories:', catErr.message)
    if (catErr.message.includes('duplicate')) {
      console.log('Categories may already exist. Continuing with services...\n')
    } else {
      return
    }
  } else {
    console.log('✅ Inserted categories:')
    newCats.forEach(c => console.log(`   → ${c.id}: ${c.name} (${c.slug})`))
    console.log()
  }

  // ──────────────────────────────────────────────────────────
  // STEP 2: Insert services under the new categories
  // ──────────────────────────────────────────────────────────
  console.log('STEP 2: Inserting services for Ice Cream Rental & Crochets...')

  const newServices = [
    // ── Ice Cream Rental (category_id: 5) ──────────────
    {
      name: 'Classic Ice Cream Cart',
      slug: 'classic-ice-cream-cart',
      category_id: 5,
      short_description: 'A beautifully styled vintage ice cream cart with 4 flavour selections for your event.',
      full_description: 'Our classic ice cream cart setup includes a beautifully styled vintage cart, 4 premium flavour selections, waffle cones, cups, and all necessary serving accessories. Perfect for birthdays, baby showers, and intimate gatherings.',
      hero_image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=600&auto=format&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=600&auto=format&fit=crop',
      starting_price: 8000,
      price_model: 'fixed',
      pricing_type: 'custom',
      currency: 'INR',
      accept_payment: false,
      payment_type: 'inquiry',
      is_active: true,
      sort_order: 1,
    },
    {
      name: 'Premium Sundae Bar',
      slug: 'premium-sundae-bar',
      category_id: 5,
      short_description: 'A full sundae bar experience with 6+ flavours, toppings station, and themed styling.',
      full_description: 'Our premium sundae bar is the ultimate ice cream experience — featuring 6+ artisan flavours, a fully stocked toppings station with sprinkles, sauces, nuts, and fresh fruits. Includes themed styling to match your event decor.',
      hero_image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600&auto=format&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600&auto=format&fit=crop',
      starting_price: 15000,
      price_model: 'fixed',
      pricing_type: 'custom',
      currency: 'INR',
      accept_payment: false,
      payment_type: 'inquiry',
      is_active: true,
      sort_order: 2,
    },
    {
      name: 'Mini Ice Cream Cups (Party Pack)',
      slug: 'mini-ice-cream-cups-party-pack',
      category_id: 5,
      short_description: 'Pre-portioned mini cups with personalised labels — ideal for return gifts or party favours.',
      full_description: 'Perfect for party favours and return gifts! Each cup is pre-portioned and features personalised labels matching your event theme. Minimum order of 25 cups. Available in vanilla, chocolate, strawberry, mango, and butterscotch.',
      hero_image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=600&auto=format&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=600&auto=format&fit=crop',
      starting_price: 3500,
      price_model: 'fixed',
      pricing_type: 'custom',
      currency: 'INR',
      accept_payment: false,
      payment_type: 'inquiry',
      is_active: true,
      sort_order: 3,
    },

    // ── Crochets (category_id: 6) ─────────────────────
    {
      name: 'Crochet Flower Bouquet',
      slug: 'crochet-flower-bouquet',
      category_id: 6,
      short_description: 'Handcrafted crochet flower bouquet — everlasting blooms that never wilt.',
      full_description: 'A stunning handmade crochet bouquet featuring an arrangement of roses, tulips, and daisies crafted from premium yarn. Each bouquet takes 15-20 hours to complete and comes wrapped in kraft paper with a personalised tag. Available in custom colour palettes.',
      hero_image: '/images/crochets-category.png',
      image_url: '/images/crochets-category.png',
      starting_price: 2500,
      price_model: 'fixed',
      pricing_type: 'custom',
      currency: 'INR',
      accept_payment: false,
      payment_type: 'inquiry',
      is_active: true,
      sort_order: 1,
    },
    {
      name: 'Amigurumi Keepsake',
      slug: 'amigurumi-keepsake',
      category_id: 6,
      short_description: 'Custom crochet amigurumi stuffed toy — a personalised keepsake for any occasion.',
      full_description: 'Our custom amigurumi keepsakes are hand-crocheted stuffed figures made to order. Choose from animals, characters, or request a custom design. Each piece is crafted with hypoallergenic yarn and stuffed with premium polyester filling. Perfect as birthday gifts, baby shower presents, or anniversary keepsakes.',
      hero_image: 'https://images.unsplash.com/photo-1595377233498-1aab8e56e544?q=80&w=600&auto=format&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1595377233498-1aab8e56e544?q=80&w=600&auto=format&fit=crop',
      starting_price: 1800,
      price_model: 'fixed',
      pricing_type: 'custom',
      currency: 'INR',
      accept_payment: false,
      payment_type: 'inquiry',
      is_active: true,
      sort_order: 2,
    },
    {
      name: 'Crochet Event Favours (Set of 10)',
      slug: 'crochet-event-favours-set-10',
      category_id: 6,
      short_description: 'Bulk mini crochet pieces for event favours — keychains, mini flowers, or small animals.',
      full_description: 'Delight your guests with handmade crochet event favours! Each set includes 10 mini pieces — choose from keychains, mini flower stems, tiny hearts, or small animal figures. Available in custom colours to match your event palette.',
      hero_image: 'https://images.unsplash.com/photo-1592839541110-c16e25a7f6f4?q=80&w=600&auto=format&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1592839541110-c16e25a7f6f4?q=80&w=600&auto=format&fit=crop',
      starting_price: 3000,
      price_model: 'fixed',
      pricing_type: 'custom',
      currency: 'INR',
      accept_payment: false,
      payment_type: 'inquiry',
      is_active: true,
      sort_order: 3,
    },
    {
      name: 'Crochet Table Centrepiece',
      slug: 'crochet-table-centrepiece',
      category_id: 6,
      short_description: 'A handcrafted crochet centrepiece arrangement for table decor at events or home display.',
      full_description: 'Elevate your table setting with a bespoke crochet centrepiece. Each arrangement features a mix of crochet flowers, leaves, and decorative elements arranged in a rustic basket or glass vase. Can be customised to match any colour scheme or theme.',
      hero_image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=600&auto=format&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=600&auto=format&fit=crop',
      starting_price: 3500,
      price_model: 'fixed',
      pricing_type: 'custom',
      currency: 'INR',
      accept_payment: false,
      payment_type: 'inquiry',
      is_active: true,
      sort_order: 4,
    },
  ]

  const { data, error } = await supabase.from('services').insert(newServices).select()
  
  if (error) {
    console.error('Error inserting services:', error.message)
  } else {
    console.log(`✅ Successfully inserted ${data.length} new services!`)
    data.forEach(s => console.log(`   → ${s.name} (category_id: ${s.category_id})`))
  }

  // ──────────────────────────────────────────────────────────
  // VERIFY: List all categories now
  // ──────────────────────────────────────────────────────────
  console.log('\n── Final categories list:')
  const { data: allCats } = await supabase.from('categories').select('id, name, slug').order('id')
  allCats?.forEach(c => console.log(`   ${c.id}: ${c.name} (${c.slug})`))
}

run()
