import { buildOgImage } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Prețuri | Merx'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return buildOgImage({
    badge: 'Prețuri',
    title: 'Prețuri simple, fără surprize',
    description: 'De la €19/lună. 14 zile trial gratuit pe Starter, fără card.',
    path: '/pricing',
  })
}
