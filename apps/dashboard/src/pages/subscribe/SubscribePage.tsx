import { PLAN_CONFIG, type PlanId } from '@merx/types'

function CheckIcon({ highlight }: { highlight: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={highlight ? 'text-indigo-200 flex-shrink-0 mt-0.5' : 'text-indigo-500 flex-shrink-0 mt-0.5'}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

const PLAN_CTAS: Record<string, string> = {
  starter: 'Alege Starter',
  pro: 'Alege Pro',
  scale: 'Alege Scale',
  enterprise: 'Contactează-ne',
}

const ANALYTICS_LABEL: Record<string, string> = {
  basic: 'Basic',
  full: 'Full',
  full_csv: 'Full + CSV',
  custom: 'Custom',
}

const SUPPORT_LABEL: Record<string, string> = {
  email: 'Email',
  email_chat: 'Email + chat',
  priority: 'Prioritar',
  dedicated_sla: 'Dedicated SLA',
}

function getPlanFeatureRows(planId: PlanId) {
  const { limits, capabilities } = PLAN_CONFIG[planId]
  const fmt = (n: number | null) => (n === null ? 'Nelimitat' : n.toLocaleString('ro-RO'))
  return [
    { label: 'comenzi / lună', value: fmt(limits.monthlyOrders) },
    { label: 'produse', value: fmt(limits.products) },
    { label: 'mesaje AI / lună', value: fmt(limits.aiMessages) },
    { label: 'analytics', value: ANALYTICS_LABEL[capabilities.analyticsLevel] },
    { label: 'suport', value: SUPPORT_LABEL[capabilities.supportLevel] },
  ]
}

export function SubscribePage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Alege un plan
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Lansează-ți magazinul și începe să vinzi. Schimbi planul oricând.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {Object.values(PLAN_CONFIG).map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-6 flex flex-col ${
              plan.highlight
                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 ring-2 ring-indigo-600'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-gray-900 dark:text-gray-100'
            }`}
          >
            {/* Recommended badge */}
            {plan.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  Recomandat
                </span>
              </div>
            )}

            {/* Trial badge */}
            {plan.trialDays !== null && (
              <div className="mb-3">
                <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                  {plan.trialDays} zile gratuit
                </span>
              </div>
            )}

            {/* Plan name */}
            <p
              className={`text-sm font-semibold uppercase tracking-widest ${
                plan.highlight ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {plan.name}
            </p>

            {/* Price */}
            <div className="mt-3 mb-6">
              {plan.price !== null ? (
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold">€{plan.price}</span>
                  <span
                    className={`text-sm mb-1 ${
                      plan.highlight ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    /lună
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-extrabold">Contact</span>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3 flex-1 mb-8">
              {getPlanFeatureRows(plan.id).map((f) => (
                <li key={f.label} className="flex items-start gap-2.5">
                  <CheckIcon highlight={plan.highlight} />
                  <span
                    className={`text-sm leading-snug ${
                      plan.highlight ? 'text-indigo-100' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        plan.highlight ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {f.value}
                    </span>{' '}
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            {plan.id === 'enterprise' ? (
              <a
                href="mailto:hello@merx.com"
                className={`block w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                {PLAN_CTAS[plan.id]}
              </a>
            ) : (
              <a
                href={`mailto:hello@merx.com?subject=Abonament ${plan.name}`}
                className={`block w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {PLAN_CTAS[plan.id]}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
        Ai întrebări?{' '}
        <a href="mailto:hello@merx.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Scrie-ne
        </a>{' '}
        și îți răspundem în maxim 24h.
      </p>
    </div>
  )
}
