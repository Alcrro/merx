interface DowngradeWarningProps {
  title: string
  items: string[]
}

export function DowngradeWarning({ title, items }: DowngradeWarningProps) {
  return (
    <div className="rounded-xl bg-warning/5 border-l-4 border-warning/60 p-4 space-y-2">
      <p className="text-sm font-semibold text-warning">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-warning/80">
            <span className="mt-0.5 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
