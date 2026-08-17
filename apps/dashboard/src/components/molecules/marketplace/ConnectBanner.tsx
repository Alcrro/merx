import { useState } from 'react'
import { useConnectStatus, useConnectOnboard } from '../../../hooks/useMarketplace'
import { Button } from '../../atoms/Button'

export function ConnectBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { data: connectStatus } = useConnectStatus()
  const { mutate: onboard, isPending } = useConnectOnboard()

  if (dismissed) return null
  if (!connectStatus) return null
  if (connectStatus.canCreateListings) return null

  const isOnboarding = connectStatus.status === 'onboarding'

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-indigo-500 dark:text-indigo-400 text-lg">✦</span>
        <div>
          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
            {isOnboarding ? 'Finalizează configurarea Stripe' : 'Activează Merx Marketplace'}
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
            {isOnboarding
              ? 'Contul tău Stripe nu este complet — continuă procesul de onboarding.'
              : 'Conectează un cont Stripe pentru a putea posta și vinde pe marketplace.'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={() => onboard()}
          disabled={isPending}
        >
          {isPending ? 'Se redirecționează...' : isOnboarding ? 'Continuă' : 'Activează'}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 text-lg leading-none"
          aria-label="Închide"
        >
          ×
        </button>
      </div>
    </div>
  )
}
