import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjrwpulvystjkcfeldpk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const sampleServices = [
  // Photobooth Rental (category_id: 1)
  {
    name: 'Classic Enclosed Photobooth',
    slug: 'classic-enclosed-photobooth',
    category_id: 1,
    short_description: 'Traditional enclosed booth for a classic feel, complete with physical prints and props.',
    full_description: 'Our traditional enclosed booth provides privacy and instant physical prints for guests.',
    hero_image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=600&auto=format&fit=crop',
    starting_price: 15000,
    price_model: 'Starting from',
    is_active: true,
    sort_order: 1
  },
  {
    name: 'Modern Open-Air Booth',
    slug: 'modern-open-air-booth',
    category_id: 1,
    short_description: 'Sleek open-air setup allowing large groups and customized backdrops.',
    full_description: 'Perfect for large group shots with customized sequin or floral backdrops.',
    hero_image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=600&auto=format&fit=crop',
    starting_price: 20000,
    price_model: 'Starting from',
    is_active: true,
    sort_order: 2
  },
  {
    name: 'Glamour Booth Experience',
    slug: 'glamour-booth',
    category_id: 1,
    short_description: 'High-end studio lighting with B&W smoothing filters for that Hollywood look.',
    full_description: 'Premium lighting and smoothing filters for a flawless look.',
    hero_image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop',
    starting_price: 25000,
    price_model: 'Starting from',
    is_active: true,
    sort_order: 3
  },

  // Dinner Night (category_id: 3)
  {
    name: 'Intimate Candlelight Dinner',
    slug: 'intimate-candlelight-dinner',
    category_id: 3,
    short_description: 'A cozy setup featuring hundreds of tealight candles, rose petals, and a private dining table.',
    full_description: 'Perfect for anniversaries or romantic dates.',
    hero_image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600&auto=format&fit=crop',
    starting_price: 8000,
    price_model: 'Fixed Package',
    is_active: true,
    sort_order: 1
  },
  {
    name: 'Premium Rooftop Dining Experience',
    slug: 'premium-rooftop-dining',
    category_id: 3,
    short_description: 'An elevated experience under the stars with premium tableware and custom lighting.',
    full_description: 'Exclusive rooftop styling.',
    hero_image: 'https://images.unsplash.com/photo-1517457210515-568393e877e8?q=80&w=600&auto=format&fit=crop',
    starting_price: 15000,
    price_model: 'Fixed Package',
    is_active: true,
    sort_order: 2
  },
  {
    name: 'Boho Picnic Setup',
    slug: 'boho-picnic-setup',
    category_id: 3,
    short_description: 'A relaxed, bohemian floor seating arrangement with plush cushions, low tables, and dried florals.',
    full_description: 'Casual yet highly aesthetic dining setup.',
    hero_image: 'https://images.unsplash.com/photo-1601614264627-99bc799cf8e1?q=80&w=600&auto=format&fit=crop',
    starting_price: 6000,
    price_model: 'Starting from',
    is_active: true,
    sort_order: 3
  },

  // Event & Decor - Birthday (category_id: 4)
  {
    name: 'Elegant Birthday Setup',
    slug: 'elegant-birthday-setup',
    category_id: 4,
    short_description: 'A sophisticated balloon garland setup with custom neon signs and floral accents.',
    full_description: 'Bespoke birthday styling tailored to your theme.',
    hero_image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
    starting_price: 12000,
    price_model: 'Starting from',
    is_active: true,
    sort_order: 1
  },
  {
    name: 'Kids Themed Birthday Decor',
    slug: 'kids-themed-birthday',
    category_id: 4,
    short_description: 'Immersive character themes, pastel balloons, and personalized cake tables.',
    full_description: 'Bring their favorite stories to life.',
    hero_image: 'https://images.unsplash.com/photo-1518005391694-a169b18bc894?q=80&w=600&auto=format&fit=crop',
    starting_price: 15000,
    price_model: 'Custom Quote',
    is_active: true,
    sort_order: 2
  },

  // Event & Decor - Anniversary (category_id: 4)
  {
    name: 'Silver Jubilee Anniversary Setup',
    slug: 'silver-jubilee-anniversary',
    category_id: 4,
    short_description: 'Stunning silver and white themed decor featuring elegant floral arches and metallic accents.',
    full_description: 'Celebrate 25 years in style.',
    hero_image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop',
    starting_price: 18000,
    price_model: 'Custom Quote',
    is_active: true,
    sort_order: 1
  },
  {
    name: 'Romantic Anniversary Suite Styling',
    slug: 'romantic-anniversary-suite',
    category_id: 4,
    short_description: 'Transforming your hotel suite into a romantic haven with balloons on the ceiling and rose petals.',
    full_description: 'Surprise them in the comfort of your room.',
    hero_image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=600&auto=format&fit=crop',
    starting_price: 7000,
    price_model: 'Fixed Package',
    is_active: true,
    sort_order: 2
  },

  // Event & Decor - Proposal (category_id: 4)
  {
    name: 'Marry Me Light-Up Letters Proposal',
    slug: 'marry-me-letters-proposal',
    category_id: 4,
    short_description: 'Giant LED "MARRY ME" letters accompanied by a thick bed of red rose petals and candles.',
    full_description: 'The ultimate grand gesture.',
    hero_image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop',
    starting_price: 10000,
    price_model: 'Starting from',
    is_active: true,
    sort_order: 1
  },
  {
    name: 'Floral Archway Proposal',
    slug: 'floral-archway-proposal',
    category_id: 4,
    short_description: 'A breathtaking arch entirely composed of fresh seasonal florals framing the big moment.',
    full_description: 'Perfect for outdoor or garden proposals.',
    hero_image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=600&auto=format&fit=crop',
    starting_price: 25000,
    price_model: 'Custom Quote',
    is_active: true,
    sort_order: 2
  },

  // Event & Decor - Corporate (category_id: 4)
  {
    name: 'Corporate Brand Launch Setup',
    slug: 'corporate-brand-launch',
    category_id: 4,
    short_description: 'Professional event styling with custom branded backdrops, balloon walls, and elegant focal points.',
    full_description: 'Make your product launch memorable.',
    hero_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
    starting_price: 30000,
    price_model: 'Custom Quote',
    is_active: true,
    sort_order: 1
  },

  // Event & Decor - Special Occasion (category_id: 4)
  {
    name: 'Baby Shower Pastel Setup',
    slug: 'baby-shower-pastel',
    category_id: 4,
    short_description: 'Soft pastel decor, "Oh Baby" neon signage, and curated dessert table styling.',
    full_description: 'A beautiful setting to welcome the little one.',
    hero_image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop',
    starting_price: 12000,
    price_model: 'Starting from',
    is_active: true,
    sort_order: 1
  }
]

async function run() {
  console.log('Signing in as Admin...')
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@keepsake.com',
    password: 'Admin@123'
  })

  if (authError) {
    console.error('Failed to sign in:', authError.message)
    return
  }
  
  console.log('Successfully signed in. Inserting sample services...')
  
  const { data, error } = await supabase.from('services').insert(sampleServices).select()
  
  if (error) {
    console.error('Error inserting data:', error.message)
  } else {
    console.log(`✅ Successfully inserted ${data.length} sample services!`)
  }
}

run()
