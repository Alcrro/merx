import { MobileMenu } from '@/components/molecules/navbar/MobileMenu'
import { getWwwUser } from '@/services/session'
import { DASHBOARD_URL } from '@/config/nav'
import type { NavItem } from '@/config/nav'

interface NavMobileServerProps {
  items: readonly NavItem[]
}

export async function NavMobileServer({ items }: NavMobileServerProps) {
  const user = await getWwwUser()
  return <MobileMenu items={items} dashboardUrl={DASHBOARD_URL} user={user} />
}
