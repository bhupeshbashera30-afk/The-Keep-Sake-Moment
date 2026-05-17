import type { SyntheticEvent } from 'react'
import { HOME_CATEGORY_CARDS, SERVICE_CATEGORIES } from './siteConfig'

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  crochets: '/images/crochets-category.png',
  hampers: '/images/hampers-category.png',
  flowers: '/images/hampers-category.png',
  ...Object.fromEntries(HOME_CATEGORY_CARDS.map((category) => [category.slug, category.image])),
  ...Object.fromEntries(SERVICE_CATEGORIES.map((category) => [category.slug, category.image])),
}

export function categoryFallbackImage(category?: string | null) {
  return category ? CATEGORY_FALLBACK_IMAGES[category] : undefined
}

export function productImageSource(imageUrl: string | null | undefined, id: string, category?: string | null) {
  return imageUrl || categoryFallbackImage(category) || '/images/logo-transparent.png'
}

export function imageFallbackSource(id: string | number, category?: string | null) {
  return categoryFallbackImage(category) || '/images/logo-transparent.png'
}

export function applyImageFallback(event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string) {
  const image = event.currentTarget

  if (image.dataset.fallbackApplied === 'true') return

  image.dataset.fallbackApplied = 'true'
  image.src = fallbackSrc
}
