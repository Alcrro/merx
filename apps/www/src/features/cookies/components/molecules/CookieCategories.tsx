import { CATEGORIES, TYPE_BADGE } from '@/features/cookies/config'

export function CookieCategories() {
  return (
    <div id="categorii" className="scroll-mt-8">
      <h2 className="text-lg font-bold text-fg mb-4">2. Categorii de cookies</h2>
      <div className="space-y-6">
        {CATEGORIES.map((cat) => (
          <div key={cat.type} className="rounded-xl border border-line p-5 bg-surface-elevated">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[cat.type]}`}>
                {cat.type}
              </span>
              <span className="text-xs text-fg-subtle">{cat.badge}</span>
            </div>
            <p className="text-sm text-fg-muted leading-relaxed">{cat.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-fg-muted">
        Nu folosim cookie-uri de advertising, retargeting sau tracking de rețele sociale.
      </p>
    </div>
  )
}
