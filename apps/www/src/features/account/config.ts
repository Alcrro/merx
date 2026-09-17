import type { JSX } from 'react'
import { UserIcon } from './components/atoms/UserIcon'
import { LockIcon } from './components/atoms/LockIcon'
import { StarIcon } from './components/atoms/StarIcon'
import { CardIcon } from './components/atoms/CardIcon'
import { SettingsIcon } from './components/atoms/SettingsIcon'

interface NavItem {
  key: string
  href: string
  icon: (props: { className?: string }) => JSX.Element
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'profile', href: '/account/profile', icon: UserIcon },
  { key: 'security', href: '/account/security', icon: LockIcon },
  { key: 'subscription', href: '/account/subscription', icon: StarIcon },
  { key: 'billing', href: '/account/billing', icon: CardIcon },
  { key: 'settings', href: '/account/settings', icon: SettingsIcon },
]

export const BOTTOM_NAV_ITEMS: readonly NavItem[] = NAV_ITEMS.filter(
  (item) => item.key !== 'billing'
)
