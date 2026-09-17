import { BROWSERS } from '@/features/cookies/config'

export function BrowsersList() {
  return (
    <>
      <p className="font-semibold text-fg mb-2">Setările browserului</p>
      <p className="text-sm text-fg-muted mb-3">
        Poți configura browserul să blocheze sau să șteargă cookie-urile. Blocarea cookie-urilor
        esențiale va afecta funcționarea platformei.
      </p>
      <ul className="space-y-1.5 list-disc list-inside marker:text-fg-subtle">
        {BROWSERS.map((b) => (
          <li key={b.name} className="text-sm text-fg-muted">
            <strong className="text-fg">{b.name}:</strong> {b.path}
          </li>
        ))}
      </ul>
    </>
  )
}
