import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/atoms/Logo'
import { NavDropdown } from '@/components/molecules/navbar/NavDropdown'
import { NavUserSkeleton } from '@/components/molecules/navbar/NavUserSkeleton'
import { NavUser } from '@/components/organisms/navbar/NavUser'
import { NavMobileServer } from '@/components/organisms/navbar/NavMobileServer'
import { LocaleSwitcher } from '@/components/atoms/LocaleSwitcher'
import { FeatureIcon } from '@/components/atoms/FeatureIcon'
import { Link } from '@/i18n/navigation'
import { NAV_ITEMS, FEATURE_ICONS } from '@/config/nav'
import { NavbarShell } from '@/components/organisms/navbar/NavbarShell'
import type { NavItem } from '@/config/nav'

const NAV_KEYS: Record<string, 'features' | 'pricing' | 'about' | 'contact'> = {
  Features: 'features',
  Pricing: 'pricing',
  About: 'about',
  Contact: 'contact',
}

const FEAT_KEYS: Record<string, 'aiAgent' | 'analytics' | 'inventory' | 'storefront' | 'marketplace'> = {
  'AI Agent': 'aiAgent',
  Analytics: 'analytics',
  Inventory: 'inventory',
  Storefront: 'storefront',
  Marketplace: 'marketplace',
}

export async function Navbar() {
  const t = await getTranslations('nav')

  const featureLabelMap = {
    aiAgent: t('featureLabels.aiAgent'),
    analytics: t('featureLabels.analytics'),
    inventory: t('featureLabels.inventory'),
    storefront: t('featureLabels.storefront'),
    marketplace: t('featureLabels.marketplace'),
  }

  const featureDescMap = {
    aiAgent: t('featureDescriptions.aiAgent'),
    analytics: t('featureDescriptions.analytics'),
    inventory: t('featureDescriptions.inventory'),
    storefront: t('featureDescriptions.storefront'),
    marketplace: t('featureDescriptions.marketplace'),
  }

  const translatedNavItems: NavItem[] = NAV_ITEMS.map((item) => {
    const topKey = NAV_KEYS[item.label]
    if ('dropdown' in item) {
      return {
        label: topKey ? t(topKey) : item.label,
        dropdown: item.dropdown.map((d) => {
          const fKey = FEAT_KEYS[d.label]
          return { label: fKey ? featureLabelMap[fKey] : d.label, href: d.href }
        }),
      }
    }
    return { label: topKey ? t(topKey) : item.label, href: item.href }
  })

  return (
    <NavbarShell>
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-8">
          <Logo />

          <nav aria-label="Navigare principală" className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const topKey = NAV_KEYS[item.label]
              const translatedLabel = topKey ? t(topKey) : item.label
              if ('dropdown' in item) {
                return (
                  <NavDropdown
                    key={item.label}
                    label={translatedLabel}
                    items={item.dropdown.map((d) => {
                      const fKey = FEAT_KEYS[d.label]
                      return {
                        label: fKey ? featureLabelMap[fKey] : d.label,
                        href: d.href,
                        description: fKey ? featureDescMap[fKey] : undefined,
                        icon: <FeatureIcon path={FEATURE_ICONS[d.label] ?? ''} />,
                      }
                    })}
                  />
                )
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {translatedLabel}
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LocaleSwitcher />
            <Suspense fallback={<NavUserSkeleton />}>
              <NavUser />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <NavMobileServer items={translatedNavItems} />
          </Suspense>
        </div>
      </div>
    </NavbarShell>
  )
}
