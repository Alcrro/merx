import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { FanCourierLogo } from '@/features/home/components/atoms/FanCourierLogo'
import { DpdLogo } from '@/features/home/components/atoms/DpdLogo'

export async function LogosSection() {
  const t = await getTranslations('home.logos')

  return (
    <section className="border-b border-line bg-surface py-12">
      <div className="container-page">
        <p className="text-center text-eyebrow mb-8">{t('label')}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">

          <div className="opacity-60 hover:opacity-100 transition-opacity">
            <Image src="/logos/stripe.svg" alt="Stripe" width={100} height={42} unoptimized className="h-10 w-auto object-contain" />
          </div>

          <div className="opacity-60 hover:opacity-100 transition-opacity text-gray-900 dark:text-white">
            <FanCourierLogo className="h-14 w-auto" />
          </div>

          <div className="opacity-60 hover:opacity-100 transition-opacity text-gray-900 dark:text-white">
            <DpdLogo className="h-10 w-auto" />
          </div>

          <div className="opacity-60 hover:opacity-100 transition-opacity">
            <Image src="/logos/cargus.svg" alt="Cargus" width={150} height={50} unoptimized className="h-12 w-auto object-contain" />
          </div>

        </div>
      </div>
    </section>
  )
}
