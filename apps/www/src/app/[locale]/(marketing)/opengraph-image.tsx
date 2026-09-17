import { buildOgImage } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Merx — Magazinul tău online, operat de AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return buildOgImage({
    badge: 'AI-Native Ecommerce',
    title: 'Magazinul tău online, operat de AI',
    description: 'Gestionează comenzile, stocul și clienții automat. Tu te ocupi de produse.',
    path: '',
  })
}
