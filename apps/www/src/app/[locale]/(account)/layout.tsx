import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import { AccountNavbar } from '@/components/organisms/navbar/AccountNavbar'
import { AccountSidebar } from '@/features/account/components/molecules/AccountSidebar'
import { AccountUserCard } from '@/features/account/components/molecules/AccountUserCard'
import { TrialBanner } from '@/features/account/components/molecules/TrialBanner'
import { EmailVerificationBanner } from '@/features/account/components/molecules/EmailVerificationBanner'
import { AccountFooter } from '@/features/account/components/molecules/AccountFooter'
import { getAccountUser } from '@/services/account'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getAccountUser()
  if (!user) redirect('/login')

  return (
    <>
      <div className="flex flex-col min-h-screen bg-surface-subtle">
        <AccountNavbar />
        <div className="flex-1">
          <TrialBanner planStatus={user.planStatus} trialEndsAt={user.trialEndsAt} />
          {!user.emailVerified && <EmailVerificationBanner />}
          <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-8 md:pt-4 md:pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div id="account-sidebar" className="flex flex-col gap-3 md:w-52 md:shrink-0 md:sticky md:top-14">
                <div className="hidden md:block">
                  <AccountUserCard
                    name={user.name}
                    email={user.email}
                    avatarUrl={user.avatarUrl}
                    planStatus={user.planStatus}
                    planId={user.planId}
                  />
                </div>
                <AccountSidebar />
              </div>
              <main id="account-content" tabIndex={-1} className="flex-1 min-w-0 bg-surface-recessed rounded-2xl p-4 sm:p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
        <AccountFooter />
      </div>
    </>
  )
}
