import { buildOgImage } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Marketplace | Merx'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return buildOgImage({
    badge: 'Marketplace B2B',
    title: 'Cumpără și vinde între merchant Merx',
    description: 'Feed B2B cu produse verificate, plăți Stripe, scor de risc transparent.',
    path: '/marketplace',
  })
}
