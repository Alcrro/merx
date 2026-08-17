import { useNavigate } from 'react-router-dom'

interface Action {
  label: string
  path: string
}

interface Rule {
  keywords: string[]
  actions: Action[]
}

const rules: Rule[] = [
  {
    keywords: ['stoc epuizat', 'stoc critic', 'reaprovizion', 'epuizat', 'critic'],
    actions: [
      { label: 'Ajustează inventarul', path: '/inventory' },
      { label: 'Vezi comenzile afectate', path: '/orders?fulfillmentStatus=unfulfilled' },
    ],
  },
  {
    keywords: ['neonorat', 'nelivrat', 'unfulfilled', 'livrare', 'de livrat'],
    actions: [
      { label: 'Procesează comenzile', path: '/orders?fulfillmentStatus=unfulfilled' },
      { label: 'Verifică stocurile', path: '/inventory' },
    ],
  },
  {
    keywords: ['comandă', 'comenzi', 'ramburs', 'anulat', 'refund'],
    actions: [
      { label: 'Mergi la Comenzi', path: '/orders' },
      { label: 'Vezi Analytics', path: '/analytics' },
    ],
  },
  {
    keywords: ['vânzări', 'revenue', 'profit', 'încasări', 'aov', 'evolu'],
    actions: [
      { label: 'Vezi Analytics complet', path: '/analytics' },
      { label: 'Explorează produsele', path: '/products' },
    ],
  },
  {
    keywords: ['produs', 'top produse', 'bine vândut', 'vânzări produs'],
    actions: [
      { label: 'Gestionează produsele', path: '/products' },
      { label: 'Verifică stocurile', path: '/inventory' },
    ],
  },
]

const defaultActions: Action[] = [
  { label: 'Overview', path: '/dashboard' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Comenzi', path: '/orders' },
]

function getActions(content: string): Action[] {
  const lower = content.toLowerCase()
  for (const rule of rules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.actions
    }
  }
  return defaultActions
}

interface SuggestedActionsProps {
  lastAssistantMessage: string
}

export function SuggestedActions({ lastAssistantMessage }: SuggestedActionsProps) {
  const navigate = useNavigate()
  const actions = getActions(lastAssistantMessage)

  return (
    <div className="px-4 py-2 flex items-center gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800">
      <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">Acționează:</span>
      {actions.map((a) => (
        <button
          key={a.path}
          onClick={() => navigate(a.path)}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-400 transition"
        >
          {a.label}
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  )
}
