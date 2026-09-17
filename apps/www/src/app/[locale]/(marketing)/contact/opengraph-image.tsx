import { buildOgImage } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Contact | Merx'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return buildOgImage({
    badge: 'Contact',
    title: 'Cum te putem ajuta?',
    description: 'Vânzări, suport tehnic, legal sau presă — răspundem în maxim 24h.',
    path: '/contact',
  })
}
