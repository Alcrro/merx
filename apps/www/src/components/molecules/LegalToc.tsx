interface Section {
  id: string
  label: string
}

interface LegalTocProps {
  sections: readonly Section[]
}

export function LegalToc({ sections }: LegalTocProps) {
  return (
    <aside className="lg:w-56 flex-shrink-0">
      <div className="lg:sticky lg:top-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-4">
          Cuprins
        </p>
        <nav aria-label="Cuprins document">
          <ul className="flex flex-col gap-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-fg-muted hover:text-fg transition-colors">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
