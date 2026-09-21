import { getTranslations } from 'next-intl/server'
import { NavButton } from '@/components/atoms/NavButton'
import { NavUserMenu } from '@/components/molecules/navbar/NavUserMenu'
import { getWwwUser } from '@/services/session'

export async function NavUser() {
  const [user, t] = await Promise.all([getWwwUser(), getTranslations('nav')])

  if (user) return <NavUserMenu user={user} />

  return (
    <>
      <NavButton href="/login" variant="ghost" prefetch={false}>{t('login')}</NavButton>
      <NavButton href="/signup" variant="primary" prefetch={false}>{t('startFree')}</NavButton>
    </>
  )
}
