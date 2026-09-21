import Link from 'next/link'
import { LAST_UPDATED, SECTIONS } from '@/features/cookies/config'
import { jsonLd } from '@/features/cookies/seo'
import { LegalHero } from '@/components/molecules/LegalHero'
import { LegalToc } from '@/components/molecules/LegalToc'
import { CookieCategories } from '@/features/cookies/components/molecules/CookieCategories'
import { CookiesTable } from '@/features/cookies/components/molecules/CookiesTable'
import { BrowsersList } from '@/features/cookies/components/molecules/BrowsersList'

export { metadata } from '@/features/cookies/seo'

export default function CookiesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LegalHero title="Politica de Cookies" lastUpdated={LAST_UPDATED} />

      <section className="py-16 bg-surface">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

            <LegalToc sections={SECTIONS} />

            <div className="flex-1 min-w-0 max-w-2xl space-y-12 text-sm text-fg-muted leading-relaxed">

              <p>
                Această politică explică ce cookie-uri folosim pe{' '}
                <strong className="text-fg">merx.com</strong> și subdomeniile sale,
                de ce le folosim și cum le poți controla.
              </p>

              <div id="ce-sunt" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">1. Ce sunt cookie-urile</h2>
                <p>
                  Cookie-urile sunt fișiere text mici stocate în browserul tău atunci când vizitezi
                  un site. Permit site-ului să rețină preferințe, să mențină sesiuni autentificate
                  și să colecteze date de utilizare agregate. Nu conțin viruși și nu pot accesa alte
                  fișiere de pe dispozitivul tău.
                </p>
              </div>

              <CookieCategories />

              <CookiesTable />

              <div id="control" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">4. Cum le controlezi</h2>
                <p className="font-semibold text-fg mb-2">Banner de consimțământ</p>
                <p className="mb-4">
                  La prima vizită îți vom prezenta un banner prin care poți accepta sau refuza
                  cookie-urile de analiză. Poți modifica decizia oricând din linkul „Preferințe
                  cookies" din footer.
                </p>
                <BrowsersList />
                <div className="mt-4">
                  <p className="font-semibold text-fg mb-2">Opt-out Plausible</p>
                  <p>
                    Poți opta pentru excluderea din analiza Plausible activând „Do Not Track" în
                    browser sau folosind un ad-blocker. Plausible respectă această setare.
                  </p>
                </div>
              </div>

              <div id="modificari" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">5. Modificări ale politicii</h2>
                <p>
                  Putem actualiza această politică când introducem cookie-uri noi sau modificăm cele
                  existente. Te vom notifica prin banner la vizita următoare și vom actualiza data
                  de mai sus.
                </p>
              </div>

              <div id="contact" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">6. Contact</h2>
                <p>
                  Întrebări despre cookie-uri? Scrie-ne la{' '}
                  <a href="mailto:privacy@merx.com" className="text-primary hover:underline">
                    privacy@merx.com
                  </a>{' '}
                  sau consultă{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Politica de Confidențialitate
                  </Link>{' '}
                  pentru contextul complet GDPR.
                </p>
              </div>

              <div className="border-t border-line pt-8 text-xs text-fg-subtle">
                Document valabil începând cu {LAST_UPDATED}.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
