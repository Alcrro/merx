interface LegalHeroProps {
  title: string
  lastUpdated: string
}

export function LegalHero({ title, lastUpdated }: LegalHeroProps) {
  return (
    <section className="pt-20 pb-12 border-b border-line bg-surface">
      <div className="container-page">
        <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-3">Legal</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-fg">{title}</h1>
        <p className="mt-4 text-sm text-fg-muted">
          Ultima actualizare: <span className="font-medium text-fg">{lastUpdated}</span>
        </p>
      </div>
    </section>
  )
}
