import { getTranslations } from 'next-intl/server'

interface Stat {
  value: string
  label: string
}

export async function StatsSection() {
  const t = await getTranslations('home')
  const stats = t.raw('stats') as Stat[]

  return (
    <section className="border-y border-line bg-surface-subtle py-10">
      <div className="container-page">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <li key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-fg">{s.value}</p>
              <p className="mt-1 text-sm text-fg-muted">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
