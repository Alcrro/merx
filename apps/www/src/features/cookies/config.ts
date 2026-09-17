export const LAST_UPDATED = '10 septembrie 2026'

export const SECTIONS = [
  { id: 'ce-sunt', label: 'Ce sunt cookie-urile' },
  { id: 'categorii', label: 'Categorii de cookies' },
  { id: 'tabel', label: 'Lista completă' },
  { id: 'control', label: 'Cum le controlezi' },
  { id: 'modificari', label: 'Modificări' },
  { id: 'contact', label: 'Contact' },
] as const

export type CookieType = 'Esențial' | 'Analiză'

export interface CookieRow {
  name: string
  provider: string
  purpose: string
  type: CookieType
  duration: string
}

export const COOKIES_TABLE: CookieRow[] = [
  {
    name: 'merx_session',
    provider: 'merx.com',
    purpose: 'Menține sesiunea autentificată a utilizatorului.',
    type: 'Esențial',
    duration: '7 zile',
  },
  {
    name: 'merx_refresh',
    provider: 'merx.com',
    purpose: 'Token de reînnoire automată a sesiunii.',
    type: 'Esențial',
    duration: '30 zile',
  },
  {
    name: 'merx_theme',
    provider: 'merx.com',
    purpose: 'Memorează preferința de temă (light/dark).',
    type: 'Esențial',
    duration: '1 an',
  },
  {
    name: 'merx_cookie_consent',
    provider: 'merx.com',
    purpose: 'Reține decizia ta privind cookie-urile.',
    type: 'Esențial',
    duration: '1 an',
  },
  {
    name: '_plausible',
    provider: 'plausible.io',
    purpose: 'Analiză agregată și anonimă a traficului. Fără tracking inter-site.',
    type: 'Analiză',
    duration: 'Sesiune',
  },
]

export const TYPE_BADGE: Record<CookieType, string> = {
  Esențial:
    'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  Analiză:
    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
}

export interface CookieCategory {
  type: CookieType
  badge: string
  required: boolean
  description: string
}

export const CATEGORIES: CookieCategory[] = [
  {
    type: 'Esențial',
    badge: 'Nu pot fi dezactivate',
    required: true,
    description:
      'Necesare pentru funcționarea de bază a platformei: autentificare, sesiuni, preferințe UI. Fără ele, Merx nu poate funcționa corect. Nu necesită consimțământ conform Legii 506/2004 și Directivei ePrivacy.',
  },
  {
    type: 'Analiză',
    badge: 'Cu consimțământul tău',
    required: false,
    description:
      'Utilizăm Plausible Analytics — o soluție de analiză care nu folosește cookie-uri de tracking inter-site, nu colectează date personale identificabile și nu vinde date. Datele sunt agregate și anonimizate. Serverul Plausible este localizat în UE.',
  },
]

export const BROWSERS: { name: string; path: string }[] = [
  { name: 'Chrome', path: 'Setări → Confidențialitate și securitate → Cookie-uri' },
  { name: 'Firefox', path: 'Setări → Confidențialitate și securitate → Cookie-uri și date de site' },
  { name: 'Safari', path: 'Preferințe → Confidențialitate → Gestionare date site' },
  { name: 'Edge', path: 'Setări → Confidențialitate, căutare și servicii → Cookie-uri' },
]
