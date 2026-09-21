export const revalidate = 3600

import { Navbar } from '@/components/organisms/navbar/Navbar'
import { Footer } from '@/components/organisms/Footer'
import { SkipLink } from '@/components/atoms/SkipLink'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink href="#main-content">Sari la conținut</SkipLink>
      <Navbar />
      <div className="bg-surface-subtle">
        <main id="main-content" tabIndex={-1}>{children}</main>
        <Footer />
      </div>
    </>
  )
}
