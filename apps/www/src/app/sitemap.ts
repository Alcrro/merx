import type { MetadataRoute } from 'next'

const BASE_URL = 'https://merx.com'

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

interface SitemapEntry {
  path: string
  priority: number
  changeFrequency: ChangeFreq
}

const PAGES: SitemapEntry[] = [
  { path: '',            priority: 1.0, changeFrequency: 'weekly' },
  { path: '/pricing',    priority: 0.9, changeFrequency: 'monthly' },
  { path: '/marketplace', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact',    priority: 0.7, changeFrequency: 'yearly' },
  { path: '/privacy',    priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms',      priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies',    priority: 0.3, changeFrequency: 'yearly' },
]

const LOCALES = ['', '/ro'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const { path, priority, changeFrequency } of PAGES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}${locale}${path}`,
        priority,
        changeFrequency,
        lastModified: new Date(),
      })
    }
  }

  return entries
}
