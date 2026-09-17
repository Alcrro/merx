import { getTranslations } from 'next-intl/server'
import { TRUST_ICONS } from '@/features/auth/config'

interface TrustItem {
  title: string
  desc: string
}

export async function AuthBrandPanel() {
  const t = await getTranslations('auth.brand')
  const trustItems = t.raw('trustItems') as TrustItem[]

  return (
    <div className="hidden lg:flex flex-col justify-between h-full relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-14 py-12">
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-white/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-16 w-[320px] h-[320px] bg-violet-900/60 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex justify-end">
        <div className="inline-flex items-center gap-2 text-xs text-white/60 font-medium tracking-widest uppercase">
          Merx Platform
          <span className="w-5 h-px bg-white/40" />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-end gap-10">
        <div className="text-right">
          <h2 className="text-3xl font-bold text-white leading-tight mb-3 whitespace-pre-line">
            {t('title')}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            {t('subtitle')}
          </p>
        </div>

        <ul className="flex flex-col gap-5 items-end">
          {trustItems.map((item, i) => (
            <li key={item.title} className="flex items-start gap-3.5 flex-row-reverse">
              <span className="flex-none mt-0.5 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                {TRUST_ICONS[i]}
              </span>
              <div className="text-right">
                <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 text-right">
        <p className="text-xs text-white/40">{t('trialBadge')}</p>
      </div>
    </div>
  )
}
