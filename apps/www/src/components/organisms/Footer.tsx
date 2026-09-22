import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/atoms/Logo'
import { EmailCapture } from '@/components/molecules/EmailCapture'
import { SocialIcon } from '@/components/molecules/SocialIcon'
import { FooterAccordion } from '@/components/molecules/FooterAccordion'
import {
  FOOTER_COLUMNS,
  FOOTER_SOCIALS,
  FOOTER_META,
} from '@/config/footer'

function NavLinks({ col, t, tc }: {
  col: typeof FOOTER_COLUMNS[number]
  t: Awaited<ReturnType<typeof getTranslations<'footer'>>>
  tc: Awaited<ReturnType<typeof getTranslations<'common'>>>
}) {
  return (
    <ul className="space-y-2.5">
      {col.links.map((link) => (
        <li key={link.label}>
          {link.soon ? (
            <span className="inline-flex items-center gap-2 text-sm text-fg-subtle cursor-default">
              {t(`links.${link.label}` as 'links.features')}
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-elevated text-fg-subtle">
                {tc('comingSoon')}
              </span>
            </span>
          ) : link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg transition-colors"
            >
              {t(`links.${link.label}` as 'links.features')}
            </a>
          ) : (
            <Link
              href={link.href}
              className="text-sm text-fg-muted hover:text-fg transition-colors"
            >
              {t(`links.${link.label}` as 'links.features')}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export async function Footer() {
  const t = await getTranslations('footer')
  const tc = await getTranslations('common')

  return (
    <footer className="border-t border-line bg-surface-subtle">
      <div className="container-page py-14">

        {/* top: brand + desktop nav grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* brand */}
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-fg-muted leading-relaxed max-w-xs">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-2">
              {FOOTER_SOCIALS.map((s) => (
                <SocialIcon key={s.label} social={s} />
              ))}
            </div>
            <a
              href={`mailto:${FOOTER_META.email}`}
              className="text-sm text-fg-muted hover:text-fg transition-colors"
            >
              {FOOTER_META.email}
            </a>
          </div>

          {/* nav columns — desktop only */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.label} className="hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-4">
                {t(`columns.${col.label}` as 'columns.product')}
              </p>
              <NavLinks col={col} t={t} tc={tc} />
            </div>
          ))}
        </div>

        {/* nav accordion — mobile only */}
        <div className="md:hidden mt-8 border-t border-line divide-y divide-line">
          {FOOTER_COLUMNS.map((col) => (
            <FooterAccordion
              key={col.label}
              label={t(`columns.${col.label}` as 'columns.product')}
            >
              <NavLinks col={col} t={t} tc={tc} />
            </FooterAccordion>
          ))}
        </div>

        {/* email capture */}
        <div className="mt-10 rounded-2xl border border-line bg-surface p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex-1">
              <p className="text-sm font-semibold text-fg">{t('newsletter.title')}</p>
              <p className="mt-1 text-sm text-fg-muted">
                {t('newsletter.description')}
              </p>
            </div>
            <div className="w-full sm:w-80">
              <EmailCapture />
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line pt-8">
          <p className="text-xs text-fg-subtle">
            © {FOOTER_META.year} {FOOTER_META.company}. {t('copyright')}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2">
            <Link href="/privacy" className="text-xs text-fg-subtle hover:text-fg transition-colors">
              {t('links.privacy')}
            </Link>
            <Link href="/terms" className="text-xs text-fg-subtle hover:text-fg transition-colors">
              {t('links.terms')}
            </Link>
            <Link href="/cookies" className="text-xs text-fg-subtle hover:text-fg transition-colors">
              {t('links.cookies')}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
