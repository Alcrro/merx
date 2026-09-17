export const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3000'

export interface NavSubItem {
  label: string
  href: string
  description?: string
}

export interface NavDropdownItem {
  label: string
  dropdown: readonly NavSubItem[]
}

export interface NavLinkItem {
  label: string
  href: string
}

export type NavItem = NavDropdownItem | NavLinkItem

export const FEATURE_ICONS: Record<string, string> = {
  'AI Agent': 'M12 2a10 10 0 1 0 10 10H12V2z M20 12a8 8 0 0 1-8 8',
  Analytics: 'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3',
  Inventory:
    'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  Storefront: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Features',
    dropdown: [
      { label: 'AI Agent', href: '/#ai-agent' },
      { label: 'Analytics', href: '/#analytics' },
      { label: 'Inventory', href: '/#inventory' },
      { label: 'Storefront', href: '/#storefront' },
      { label: 'Marketplace', href: '/marketplace' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/contact' },
]
