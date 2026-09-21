import { jsonLd } from '@/features/home/seo'
import { HeroSection } from '@/features/home/components/organisms/HeroSection'
import { LogosSection } from '@/features/home/components/organisms/LogosSection'
import { StatsSection } from '@/features/home/components/organisms/StatsSection'
import { FeaturesSection } from '@/features/home/components/organisms/FeaturesSection'
import { MarketplaceSection } from '@/features/home/components/organisms/MarketplaceSection'
import { TestimonialsSection } from '@/features/home/components/organisms/TestimonialsSection'
import { AboutSection } from '@/features/home/components/organisms/AboutSection'
import { CtaSection } from '@/features/home/components/organisms/CtaSection'

export { metadata } from '@/features/home/seo'

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <LogosSection />
      <StatsSection />
      <FeaturesSection />
      <MarketplaceSection />
      <TestimonialsSection />
      <AboutSection />
      <CtaSection />
    </>
  )
}
