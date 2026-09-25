import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAccountUser } from '@/services/account'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const user = await getAccountUser()
  if (!user) redirect('/login')
  return <>{children}</>
}
