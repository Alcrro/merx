import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getAccountUser } from '@/services/account'
import { ProfileForm } from '@/features/account/components/organisms/ProfileForm'
import { AvatarUpload } from '@/features/account/components/molecules/AvatarUpload'
import { ConnectedAccounts } from '@/features/account/components/molecules/ConnectedAccounts'
import { DangerZoneSection } from '@/features/account/components/organisms/DangerZoneSection'
import { AppearanceSection } from '@/features/account/components/organisms/AppearanceSection'

export default async function SettingsPage() {
  const user = await getAccountUser()
  if (!user) redirect('/login')

  const t = await getTranslations('account.settings')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">{t('title')}</h1>
        <p className="text-sm text-fg-muted mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:flex-1 rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-line">
            <h2 className="text-sm font-semibold text-fg">{t('profile.title')}</h2>
          </div>
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="shrink-0">
              <AvatarUpload
                avatarUrl={user.avatarUrl ?? null}
                name={user.name}
                email={user.email}
              />
            </div>
            <div className="flex-1 min-w-0">
              <ProfileForm
                name={user.name}
                email={user.email}
                preferredLocale={user.preferredLocale}
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 lg:shrink-0">
          <ConnectedAccounts
            hasPassword={user.password !== null}
            hasGoogle={user.googleId !== null}
          />
        </div>
      </div>

      <AppearanceSection />

      <DangerZoneSection hasPassword={user.password !== null} lastDataExportAt={user.lastDataExportAt} />
    </div>
  )
}
