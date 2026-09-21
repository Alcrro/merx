import Link from 'next/link'
import { LAST_UPDATED, SECTIONS, DEFINITIONS, RESTRICTED_USES } from '@/features/terms/config'
import { jsonLd } from '@/features/terms/seo'
import { LegalHero } from '@/components/molecules/LegalHero'
import { LegalToc } from '@/components/molecules/LegalToc'

export { metadata } from '@/features/terms/seo'

export default function TermsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LegalHero title="Termeni și Condiții" lastUpdated={LAST_UPDATED} />

      <section className="py-16 bg-surface">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

            <LegalToc sections={SECTIONS} />

            <div className="flex-1 min-w-0 max-w-2xl space-y-12 text-sm text-fg-muted leading-relaxed">

              <p>
                Acești Termeni și Condiții („Termeni") reglementează accesul și utilizarea platformei Merx,
                operată de <strong className="text-fg">Merx SRL</strong> („Merx", „noi"). Prin crearea unui
                cont, accepți integral acești Termeni. Dacă nu ești de acord, nu utiliza platforma.
              </p>

              <div id="definitii" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">1. Definiții</h2>
                <ul className="space-y-2">
                  {DEFINITIONS.map((d) => (
                    <li key={d.term} className="flex gap-2">
                      <span className="font-semibold text-fg min-w-[110px]">{d.term}</span>
                      <span>— {d.definition}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div id="cont" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">2. Contul tău</h2>
                <p className="mb-3">
                  Ești responsabil pentru securitatea credențialelor de autentificare și pentru toate acțiunile
                  efectuate prin contul tău. Trebuie să ai cel puțin 18 ani și, dacă acționezi în numele unei
                  entități juridice, să ai autoritate de reprezentare.
                </p>
                <p>
                  Merx își rezervă dreptul de a suspenda conturile cu activitate suspectă sau care încalcă
                  acești Termeni, fără notificare prealabilă dacă situația o impune.
                </p>
              </div>

              <div id="abonamente" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">3. Abonamente și plată</h2>
                <p className="mb-3">
                  Merx oferă planuri de abonament lunar cu plată anticipată în EUR, procesate prin Stripe.
                  Prețurile sunt afișate pe{' '}
                  <Link href="/pricing" className="text-primary hover:underline">pagina de prețuri</Link>.
                  Prețurile nu includ TVA acolo unde este aplicabil.
                </p>
                <p className="mb-3">
                  <strong className="text-fg">Trial:</strong> Planul Starter include 14 zile de trial gratuit
                  fără card. La expirare, contul trece automat pe planul gratuit dacă nu introduci date de plată.
                </p>
                <p className="mb-3">
                  <strong className="text-fg">Rambursări:</strong> Nu oferim rambursări pentru perioadele deja
                  facturate. Poți anula oricând; accesul rămâne activ până la sfârșitul perioadei plătite.
                </p>
                <p>
                  <strong className="text-fg">Modificări de preț:</strong> Te vom notifica cu cel puțin 30 de
                  zile înainte de orice modificare de preț.
                </p>
              </div>

              <div id="utilizare" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">4. Utilizare acceptabilă</h2>
                <p className="mb-3">Nu poți utiliza Platforma pentru a:</p>
                <ul className="space-y-1.5 list-disc list-inside marker:text-fg-subtle">
                  {RESTRICTED_USES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div id="ai" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">5. Funcționalități AI</h2>
                <p className="mb-3">
                  Serviciile AI ale Merx oferă recomandări și pot executa acțiuni în magazinul tău (ajustări
                  de stoc, răspunsuri la clienți, actualizări de prețuri) pe baza permisiunilor pe care le configurezi.
                </p>
                <p className="mb-3">
                  <strong className="text-fg">Responsabilitatea deciziilor:</strong> Rămâi responsabil pentru
                  toate acțiunile executate de AI în magazinul tău. Recomandăm să revizuiești periodic setările
                  de permisiuni și jurnalele de activitate.
                </p>
                <p>
                  Merx nu garantează că outputurile AI sunt corecte, complete sau potrivite pentru situația ta
                  specifică. Nu te baza exclusiv pe recomandările AI pentru decizii comerciale majore.
                </p>
              </div>

              <div id="proprietate" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">6. Proprietate intelectuală</h2>
                <p className="mb-3">
                  <strong className="text-fg">Conținutul tău:</strong> Îți păstrezi toate drepturile asupra
                  Conținutului pe care îl încarci. Ne acorzi o licență limitată, neexclusivă, pentru a-l procesa
                  și afișa în scopul furnizării Serviciului.
                </p>
                <p>
                  <strong className="text-fg">Platforma:</strong> Merx deține toate drepturile asupra codului,
                  designului, logo-urilor și funcționalităților Platformei. Nu poți copia, modifica sau distribui
                  nicio parte a Platformei fără acord scris.
                </p>
              </div>

              <div id="raspundere" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">7. Limitarea răspunderii</h2>
                <p className="mb-3">
                  Platforma este furnizată „ca atare". Nu garantăm disponibilitate neîntreruptă, deși ne propunem
                  un SLA de 99.5% lunar.
                </p>
                <p className="mb-3">
                  Răspunderea totală a Merx față de tine, indiferent de natura pretenției, este limitată la
                  valoarea abonamentelor plătite în ultimele 3 luni.
                </p>
                <p>
                  Merx nu răspunde pentru pierderi indirecte, pierderi de profit, pierderi de date sau daune
                  consecutive, chiar dacă a fost notificată cu privire la posibilitatea acestora.
                </p>
              </div>

              <div id="reziliere" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">8. Reziliere</h2>
                <p className="mb-3">
                  Poți închide contul oricând din setările platformei. La închidere, datele tale vor fi păstrate
                  30 de zile pentru export, după care vor fi șterse definitiv.
                </p>
                <p>
                  Merx poate rezilia sau suspenda accesul imediat în caz de încălcare gravă a Termenilor,
                  neplată sau risc de securitate. În alte situații, îți vom oferi 15 zile de preaviz.
                </p>
              </div>

              <div id="modificari" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">9. Modificări ale Termenilor</h2>
                <p>
                  Putem actualiza acești Termeni periodic. Te vom notifica prin email cu cel puțin 14 zile
                  înainte de intrarea în vigoare a modificărilor semnificative. Continuarea utilizării Platformei
                  după data efectivă constituie acceptarea noilor Termeni.
                </p>
              </div>

              <div id="lege" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">10. Lege aplicabilă și litigii</h2>
                <p className="mb-3">
                  Acești Termeni sunt guvernați de legislația română. Orice litigiu se va soluționa pe cale
                  amiabilă în primă instanță. Dacă nu se ajunge la un acord în 30 de zile, competența revine
                  instanțelor din București, România.
                </p>
                <p>
                  Dacă ești un consumator rezident în UE, poți accesa platforma ODR a Comisiei Europene pentru
                  soluționarea alternativă a litigiilor.
                </p>
              </div>

              <div id="contact" className="scroll-mt-8">
                <h2 className="text-lg font-bold text-fg mb-4">11. Contact</h2>
                <p>
                  Pentru întrebări legate de acești Termeni, ne poți contacta la{' '}
                  <a href="mailto:legal@merx.com" className="text-primary hover:underline">legal@merx.com</a>
                  {' '}sau prin pagina de{' '}
                  <Link href="/contact" className="text-primary hover:underline">contact</Link>.
                </p>
              </div>

              <div className="border-t border-line pt-8 text-xs text-fg-subtle">
                Document valabil începând cu {LAST_UPDATED}. Versiunile anterioare pot fi solicitate la legal@merx.com.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
