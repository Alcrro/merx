import { buildOgImage } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Politica de Cookies | Merx'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return buildOgImage({
    badge: 'Legal',
    title: 'Politica de Cookies',
    description: 'Cum utilizăm cookie-urile pe merx.com și cum le poți controla.',
    path: '/cookies',
  })
}
