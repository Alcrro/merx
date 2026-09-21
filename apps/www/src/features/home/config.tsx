export interface HomeFeatureConfig {
  id: string
  visual: React.JSX.Element
}

export const FEATURE_CONFIGS: HomeFeatureConfig[] = [
  {
    id: 'ai-agent',
    visual: (
      <div className="rounded-2xl bg-gray-100 dark:bg-gray-900 p-6 font-mono text-sm text-green-600 dark:text-green-400 leading-relaxed shadow-xl ring-1 ring-gray-200 dark:ring-white/20">
        <p className="text-gray-600 dark:text-gray-400 mb-3 text-xs">agent.log — live</p>
        <p><span className="text-gray-600 dark:text-gray-400">09:14</span> Order #1842 processed ✓</p>
        <p><span className="text-gray-600 dark:text-gray-400">09:14</span> Customer notified via email ✓</p>
        <p><span className="text-gray-600 dark:text-gray-400">09:15</span> Stock updated: -2 units ✓</p>
        <p><span className="text-gray-600 dark:text-gray-400">09:15</span> <span className="text-yellow-500 dark:text-yellow-400">⚡</span>{' '}Restock recommended</p>
        <p className="mt-2 animate-pulse motion-reduce:animate-none" aria-hidden="true">█</p>
      </div>
    ),
  },
  {
    id: 'storefront-conversion',
    visual: (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Conversion Report</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 font-semibold">AI Generated</span>
        </div>
        {[
          { label: 'Business type', value: 'Ecommerce · Fashion', icon: '🏪' },
          { label: 'Audience', value: 'Women 25–40, urban', icon: '👤' },
          { label: 'Strategy', value: 'Trust-first', icon: '🎯' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-xs text-gray-600 dark:text-gray-400">{row.icon} {row.label}</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{row.value}</span>
          </div>
        ))}
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-3 space-y-2">
          <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Product page blueprint</p>
          {['Hero with social proof above fold', 'Product gallery + variants', 'Reviews before CTA', 'Urgency block (limited stock)'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-400 w-4">{i + 1}.</span>
              <span className="text-xs text-gray-700 dark:text-gray-300">{step}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'analytics',
    visual: (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-300 mb-4">Revenue — last 7 days</p>
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-indigo-100 dark:bg-indigo-900/40 relative" style={{ height: `${h}%` }}>
              <div className="absolute bottom-0 inset-x-0 bg-indigo-600 rounded-t-sm" style={{ height: `${h * 0.6}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">€3,840</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">↑ 18% vs. last week</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">142 orders</p>
            <p className="text-xs text-gray-400 mt-0.5">~€27 / order</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'inventory',
    visual: (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-xl space-y-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">Critical stock</p>
        {[
          { name: 'White T-shirt — S', stock: 2, color: 'text-red-700 bg-red-50' },
          { name: 'Sneakers — 42', stock: 5, color: 'text-amber-700 bg-amber-50' },
          { name: 'Leather jacket — M', stock: 1, color: 'text-red-700 bg-red-50' },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.color}`}>{item.stock} units</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'orders',
    visual: (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-xl">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Recent orders</p>
        <div className="space-y-2.5">
          {[
            { id: '#1842', client: 'Maria P.', value: '€99', status: 'Shipped', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-400/10' },
            { id: '#1841', client: 'Andrew M.', value: '€36', status: 'Delivered', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10' },
            { id: '#1840', client: 'Elena T.', value: '€25', status: 'Processing', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10' },
            { id: '#1839', client: 'Radu C.', value: '€153', status: 'Delivered', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10' },
          ].map((row) => (
            <div key={row.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{row.id} · {row.client}</p>
                <p className="text-xs text-gray-400">{row.value}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${row.color}`}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'customers',
    visual: (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">MP</div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Maria Popescu</p>
            <p className="text-xs text-gray-400">maria@example.com · Customer since Jan 2024</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10 px-2.5 py-1 rounded-full">Returning</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ label: 'Orders', value: '12' }, { label: 'LTV', value: '€667' }, { label: 'Last order', value: '3 days' }].map((stat) => (
            <div key={stat.label} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-2">Order history</p>
        {['#1842 · €99 · Shipped', '#1836 · €36 · Delivered', '#1821 · €153 · Delivered'].map((item) => (
          <p key={item} className="text-xs text-gray-600 dark:text-gray-300 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">{item}</p>
        ))}
      </div>
    ),
  },
  {
    id: 'discounts',
    visual: (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-xl space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Code</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2">
              <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">SUMMER25</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Discount</label>
              <div className="mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-3 py-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">25%</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Uses</label>
              <div className="mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-3 py-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">500 max</span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Min. cart</label>
            <div className="mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-3 py-2">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">€40</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-gray-400">Uses: <span className="font-semibold text-gray-700 dark:text-gray-300">247 / 500</span></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Active</span>
        </div>
      </div>
    ),
  },
]

export interface MarketplaceRowConfig {
  emoji: string
  price: string
  currency: string
  risk: string
  riskColor: string
}

export const MARKETPLACE_ROW_CONFIGS: MarketplaceRowConfig[] = [
  { emoji: '📦', price: '7.299,00', currency: 'EUR', risk: 'LOW', riskColor: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10' },
  { emoji: '📦', price: '5.999,00', currency: 'EUR', risk: 'LOW', riskColor: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10' },
  { emoji: '📦', price: '899,00', currency: 'EUR', risk: 'MEDIUM', riskColor: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10' },
  { emoji: '📦', price: '349,00', currency: 'EUR', risk: 'LOW', riskColor: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10' },
]
