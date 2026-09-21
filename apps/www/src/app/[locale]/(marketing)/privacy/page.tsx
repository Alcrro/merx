import Link from 'next/link'
import {
  LAST_UPDATED,
  SECTIONS,
  DATA_CATEGORIES,
  USES,
  LEGAL_BASES,
  SUB_PROCESSORS,
  RETENTION,
  GDPR_RIGHTS,
} from '@/features/privacy/config'
import { jsonLd } from '@/features/privacy/seo'
import { LegalHero } from '@/components/molecules/LegalHero'
import { LegalToc } from '@/components/molecules/LegalToc'

export { metadata } from '@/features/privacy/seo'

export default function PrivacyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LegalHero title="Politica de Confidențialitate" lastUpdated={LAST_UPDATED} />

      <section className="py-16 bg-surface">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

            <LegalToc sections={SECTIONS} />

            <div className="flex-1 min-w-0 max-w-2xl space-y-12 text-sm text-fg-muted leading-relaxed">

              <p>
                Merx SRL („Merx", „noi", „operatorul") se angajează să protejeze confidențialitatea datelor tale
                cu caracter personal. Această politică descrie ce date colectăm, de ce și cum le utilizăm, în
                conformitate cu Regulamentul (UE) 2016/679 (GDPR).
              </p>

              <div id="cine" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">1. Cine suntem</h2>
                <p>
                  Operatorul de date este <strong className="text-fg">Merx SRL</strong>, cu sediul în România.
                  Poți lua legătura cu noi la{' '}
                  <a href="mailto:privacy@merx.com" className="text-primary hover:underline">privacy@merx.com</a>
                  {' '}pentru orice solicitare legată de datele tale.
                </p>
              </div>

              <div id="date" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">2. Ce date colectăm</h2>
                <div className="space-y-4">
                  {DATA_CATEGORIES.map((cat) => (
                    <div key={cat.title}>
                      <p className="font-semibold text-fg mb-1">{cat.title}</p>
                      <p>{cat.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="utilizare" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">3. Cum utilizăm datele</h2>
                <ul className="space-y-2 list-disc list-inside marker:text-fg-subtle">
                  {USES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div id="temei" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">4. Temei juridic (GDPR Art. 6)</h2>
                <div className="space-y-3">
                  {LEGAL_BASES.map((lb) => (
                    <div key={lb.basis} className="flex gap-2">
                      <span className="font-semibold text-fg shrink-0 w-64">{lb.basis}</span>
                      <span>— {lb.scope}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div id="partajare" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">5. Cu cine partajăm datele</h2>
                <p className="mb-3">
                  Nu vindem datele tale. Le partajăm doar cu sub-procesatori necesari pentru funcționarea Platformei:
                </p>
                <ul className="space-y-2 list-disc list-inside marker:text-fg-subtle">
                  {SUB_PROCESSORS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3">
                  Putem divulga date autorităților competente dacă suntem obligați legal să o facem.
                </p>
              </div>

              <div id="transfer" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">6. Transfer internațional de date</h2>
                <p>
                  Unii sub-procesatori (Stripe, OpenAI) sunt localizați în SUA. Transferurile se realizează pe
                  baza Clauzelor Contractuale Standard adoptate de Comisia Europeană, asigurând un nivel adecvat
                  de protecție conform GDPR.
                </p>
              </div>

              <div id="retentie" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">7. Retenția datelor</h2>
                <div className="space-y-2">
                  {RETENTION.map((r) => (
                    <div key={r.type} className="flex gap-2">
                      <span className="font-semibold text-fg w-44 shrink-0">{r.type}</span>
                      <span>— {r.period}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div id="drepturi" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">8. Drepturile tale (GDPR)</h2>
                <p className="mb-3">În calitate de persoană vizată, ai următoarele drepturi:</p>
                <ul className="space-y-2 list-disc list-inside marker:text-fg-subtle">
                  {GDPR_RIGHTS.map((right) => (
                    <li key={right}>{right}</li>
                  ))}
                </ul>
                <p className="mt-4">
                  Exercită-ți drepturile scriind la{' '}
                  <a href="mailto:privacy@merx.com" className="text-primary hover:underline">privacy@merx.com</a>.
                  Răspundem în maxim 30 de zile. Dacă consideri că drepturile tale nu au fost respectate, poți
                  depune o plângere la <strong className="text-fg">ANSPDCP</strong>.
                </p>
              </div>

              <div id="cookies" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">9. Cookie-uri</h2>
                <p>
                  Utilizăm cookie-uri esențiale (necesare pentru autentificare și funcționare) și cookie-uri de
                  analiză agregată prin Plausible Analytics (fără tracking inter-site, doar cu consimțământul tău).
                  Detalii complete în{' '}
                  <Link href="/cookies" className="text-primary hover:underline">Politica de Cookies</Link>.
                </p>
              </div>

              <div id="modificari" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">10. Modificări ale politicii</h2>
                <p>
                  Putem actualiza această politică periodic. Te vom notifica prin email și/sau banner în platformă
                  cu cel puțin 14 zile înainte de modificări semnificative. Data „Ultima actualizare" din antet
                  reflectă întotdeauna versiunea curentă.
                </p>
              </div>

              <div id="contact" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">11. Contact</h2>
                <p>
                  Pentru orice întrebare despre modul în care prelucrăm datele tale, contactează-ne la{' '}
                  <a href="mailto:privacy@merx.com" className="text-primary hover:underline">privacy@merx.com</a>
                  {' '}sau prin{' '}
                  <Link href="/contact" className="text-primary hover:underline">pagina de contact</Link>.
                  Răspundem în maxim 2 zile lucrătoare.
                </p>
              </div>

              <div className="border-t border-line pt-8 text-xs text-fg-subtle">
                Document valabil începând cu {LAST_UPDATED}. Versiunile anterioare pot fi solicitate la privacy@merx.com.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
