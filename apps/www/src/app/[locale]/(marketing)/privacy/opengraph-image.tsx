import { buildOgImage } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Politica de Confidențialitate | Merx'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return buildOgImage({
    badge: 'Legal',
    title: 'Politica de Confidențialitate',
    description: 'Cum colectăm, utilizăm și protejăm datele tale, conform GDPR.',
    path: '/privacy',
  })
}
