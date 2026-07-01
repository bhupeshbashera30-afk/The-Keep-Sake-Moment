export type SiteCategory = {
  key: string
  label: string
}

export type ServiceCategory = {
  slug: string
  label: string
  route: string
  description: string
  image: string
  hidePricing?: boolean
}

export const SHOP_CATEGORIES: SiteCategory[] = [
  { key: 'hampers', label: 'Hampers' },
  { key: 'flowers', label: 'Flowers' },
  { key: 'crochets', label: 'Crochets' },
]

export const EVENT_DECOR_SUBPAGES = [
  {
    slug: 'birthday',
    label: 'Birthday',
    title: 'Birthday Decor',
    description:
      'Bespoke birthday setups designed around your vision, from intimate dining to full celebration styling. Every detail shaped to the occasion.',
    tags: ['Balloons & Florals', 'Themed Setups', 'Custom Backdrops', 'Cake Tables'],
  },
  {
    slug: 'anniversary',
    label: 'Anniversary',
    title: 'Anniversary Styling',
    description:
      'Romantic, editorial anniversary setups that honour milestones with elegance and warmth. Custom to every couple.',
    tags: ['Romantic Lighting', 'Floral Arches', 'Table Styling', 'Custom Signage'],
  },
  {
    slug: 'proposal',
    label: 'Proposal',
    title: 'Proposal Concepts',
    description:
      'Intimate, one-of-a-kind proposal setups crafted around the story of the two of you. The team handles every detail.',
    tags: ['Petal Pathways', 'Candle Setups', 'Floral Tunnels', 'Personalised Touches'],
  },
  {
    slug: 'corporate',
    label: 'Corporate Event',
    title: 'Corporate Events',
    description:
      'Premium brand-led event styling for corporate occasions, launches, celebrations, and team events with a refined editorial finish.',
    tags: ['Brand-Aligned Decor', 'Stage Styling', 'Branded Installations', 'Table Settings'],
  },
  {
    slug: 'special-occasion',
    label: 'Special Occasion',
    title: 'Special Occasions',
    description:
      'Designed for moments that do not fit a standard category. Whatever the occasion, the team will shape an experience worth keeping.',
    tags: ['Fully Custom', 'Any Occasion', 'Any Scale', 'Any Vision'],
  },
]

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    slug: 'event-and-decor',
    label: 'Event & Decor',
    route: '/services/event-and-decor',
    description:
      'Celebration styling for every occasion, birthdays, anniversaries, proposals, corporate events, and special gatherings.',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop',
    hidePricing: true,
  },
  {
    slug: 'photobooth-rental',
    label: 'Photobooth Rental',
    route: '/services/photobooth-rental',
    description:
      'Elegant booth setups styled for social and brand-led events. Pricing is personalised after discussing event scale, setup, and styling direction.',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600&auto=format&fit=crop',
    hidePricing: true,
  },
  {
    slug: 'dinner-night',
    label: 'Dinner Night',
    route: '/services/dinner-night',
    description:
      'Styled dining experiences designed around mood, lighting, and personal atmosphere. Fixed-price setups alongside custom add-ons.',
    image: '/images/dinner-night-category.jpg',
  },
]

export const HOME_CATEGORY_CARDS = [
  ...SERVICE_CATEGORIES.filter((category) => category.slug === 'event-and-decor'),
  {
    slug: 'flowers',
    label: 'Flower Bouquet',
    route: '/shop?category=flowers',
    description: 'Fresh and crafted flower arrangements.',
    image: '/images/flowers-category.jpg',
  },
  {
    slug: 'hampers',
    label: 'Hampers',
    route: '/shop?category=hampers',
    description: 'Curated gifting collections.',
    image: '/images/hampers-category.png',
  },
  {
    slug: 'crochets',
    label: 'Crochet',
    route: '/shop?category=crochets',
    description: 'Handmade crochet keepsakes.',
    image: '/images/crochets-category.png',
  },
  ...SERVICE_CATEGORIES.filter((category) => category.slug !== 'event-and-decor'),
]

export const HERO_SLIDES = [
  {
    image: SERVICE_CATEGORIES.find((category) => category.slug === 'photobooth-rental')!.image.replace('w=600', 'w=1600'),
    occasion: 'Photobooth Rental',
    tagline: 'Capture every moment',
  },
  {
    image: '/images/flowers-category.jpg',
    occasion: 'Hampers & Flowers',
    tagline: 'Gifts worth keeping',
  },
  {
    image: '/images/dinner-night-category.jpg',
    occasion: 'Dinner Nights',
    tagline: 'Intimate moments, curated',
  },
]

export const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    event: 'Birthday Celebration',
    text: 'Keepsake Moments turned my 30th birthday into something straight out of a magazine. Every detail was perfect, from the balloon setup to the cake table styling.',
    rating: 5,
  },
  {
    name: 'Rohan & Ananya',
    event: 'Anniversary Dinner',
    text: 'The dinner night setup was breathtaking. The candles, the flowers, the mood lighting, it felt like a private restaurant just for us. Truly unforgettable.',
    rating: 5,
  },
  {
    name: 'Meera Kapoor',
    event: 'Corporate Event',
    text: 'Professional, creative, and so easy to work with. Our corporate gala looked absolutely stunning. The photobooth was a massive hit with everyone!',
    rating: 5,
  },
  {
    name: 'Vikram Patel',
    event: 'Proposal Setup',
    text: 'I wanted the proposal to be perfect and Keepsake Moments delivered beyond my expectations. She said yes in the most beautiful setting imaginable.',
    rating: 5,
  },
]

export const NAV_MARQUEE_ITEMS = [
  'Photobooth Rental',
  'Luxury Hampers',
  'Dinner Night',
  'Event & Decor',
  'Crochets',
  ...EVENT_DECOR_SUBPAGES.map((subpage) => subpage.label),
]

export const INQUIRY_SERVICE_OPTIONS = [
  ...SERVICE_CATEGORIES.map((category) => category.label),
  'Hampers & Flower',
  ...EVENT_DECOR_SUBPAGES.map((subpage) => subpage.label),
]

export const ADMIN_PRODUCT_CATEGORIES = [
  ...SHOP_CATEGORIES.map((category) => category.key),
  ...SERVICE_CATEGORIES.map((category) => category.slug),
  ...EVENT_DECOR_SUBPAGES.map((subpage) => subpage.slug),
]

export const ACTIVE_PRODUCT_CATEGORIES = new Set(ADMIN_PRODUCT_CATEGORIES)

export function serviceCategoryBySlug(slug: string) {
  return SERVICE_CATEGORIES.find((category) => category.slug === slug)
}

// ── Booking Flow Constants ───────────────────────────────────
// Categories that use the date/time slot booking flow (instead of simple cart checkout)
export const BOOKING_CATEGORIES = new Set([
  'birthday',
  'anniversary',
  'proposal',
  'corporate',
  'special-occasion',
  'dinner-night',
  'event-and-decor',
])

export const TIME_SLOTS = [
  { id: '10-12', label: '10:00 AM – 12:00 PM', start: '10:00', end: '12:00' },
  { id: '12-14', label: '12:00 PM – 2:00 PM', start: '12:00', end: '14:00' },
  { id: '14-16', label: '2:00 PM – 4:00 PM', start: '14:00', end: '16:00' },
  { id: '16-18', label: '4:00 PM – 6:00 PM', start: '16:00', end: '18:00' },
  { id: '18-20', label: '6:00 PM – 8:00 PM', start: '18:00', end: '20:00' },
  { id: '20-22', label: '8:00 PM – 10:00 PM', start: '20:00', end: '22:00' },
]

export type AddOn = {
  id: string
  name: string
  emoji: string
  price: number
  description: string
}

export const ADDONS: AddOn[] = [
  { id: 'cake', name: 'Cake', emoji: '🎂', price: 500, description: 'Designer celebration cake' },
  { id: 'bouquet', name: 'Bouquet', emoji: '💐', price: 300, description: 'Fresh flower bouquet' },
  { id: 'photo-magazine', name: 'Photo Magazine', emoji: '📸', price: 800, description: 'Printed photo keepsake magazine' },
  { id: 'iphone-shoot', name: 'iPhone Shoot', emoji: '📱', price: 1000, description: 'Professional iPhone photography' },
  { id: 'reels-photo', name: 'Reels + Photo', emoji: '🎬', price: 1500, description: 'Instagram reels & professional photos' },
]

export const TERMS_AND_CONDITIONS = [
  'Booking is confirmed only after full payment is received.',
  'Cancellations must be made at least 48 hours before the event for a full refund.',
  'Cancellations within 24–48 hours will receive a 50% refund.',
  'No refunds for cancellations within 24 hours of the event.',
  'Add-on items are non-refundable once preparation has started.',
  'The venue/setup time may vary by ±30 minutes depending on logistics.',
  'Keepsake Moments reserves the right to modify decor elements based on availability while maintaining the overall theme.',
  'Any damages to the setup or venue caused by guests will be the customer\'s responsibility.',
]

export function isBookingCategory(category: string): boolean {
  return BOOKING_CATEGORIES.has(category)
}

export function eventDecorSubpageBySlug(slug: string) {
  return EVENT_DECOR_SUBPAGES.find((subpage) => subpage.slug === slug)
}
