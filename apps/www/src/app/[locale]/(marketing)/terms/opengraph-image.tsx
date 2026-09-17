import { buildOgImage } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Termeni și Condiții | Merx'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return buildOgImage({
    badge: 'Legal',
    title: 'Termeni și Condiții',
    description: 'Regulile de utilizare ale platformei Merx.',
    path: '/terms',
  })
}
