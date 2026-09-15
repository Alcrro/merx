import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStoreProduct, useStoreProductAnalytics, useUpdateStoreProduct } from '../../hooks/useCatalog'
import { StoreProductVariantPricing } from '../../components/organisms/catalog/StoreProductVariantPricing'
import { useAuth } from '../../hooks/useAuth'
import { formatMoney } from '../../lib/format'
import type { PeriodStats, VariantStat } from '@merx/api-client'

type Interval = '7z' | '14z' | '30z' | 'alltime'

const INTERVALS: { key: Interval; label: string }[] = [
  { key: '7z', label: '7Z' },
  { key: '14z', label: '14Z' },
  { key: '30z', label: '30Z' },
  { key: 'alltime', label: 'All time' },
]

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function SectionSkeleton({ h = 'h-40' }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800`} />
}

export function StoreProductDetailPage() {
  const { storeProductId } = useParams<{ storeProductId: string }>()
  const navigate = useNavigate()
  const { store } = useAuth()
  const currency = store?.currency ?? 'EUR'
  const [interval, setInterval] = useState<Interval>('30z')

  const { data: sp, isLoading } = useStoreProduct(storeProductId!)
  const { data: analytics, isLoading: analyticsLoading } = useStoreProductAnalytics(storeProductId!)
  const { mutateAsync: updateProduct } = useUpdateStoreProduct(storeProductId!)
  const [shippingCost, setShippingCost] = useState<string | null>(null)
  const [savingShipping, setSavingShipping] = useState(false)

  if (isLoading) {
    return <div className="flex items-center justify-center py-32 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
  }
  if (!sp) {
    return <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Produsul nu a fost găsit.</div>
  }

  const product = sp.catalogProduct
  const variants = sp.variants ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/products')}
          className="mb-3 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          ← Produsele mele
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{product?.title ?? '—'}</h1>
          {product?.category?.name && (
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              {product.category.name}
            </span>
          )}
          {product?.aiGenerated && (
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              AI generat
            </span>
          )}
        </div>
        {product?.description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">{product.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Adăugat în store la {new Date(sp.addedAt).toLocaleDateString('ro-RO')}
        </p>
      </div>

      {/* KPIs cu selector de interval */}
      {analyticsLoading ? (
        <SectionSkeleton h="h-20" />
      ) : analytics && (() => {
        const statsMap: Record<Interval, PeriodStats> = {
          '7z': analytics.last7d,
          '14z': analytics.last14d,
          '30z': analytics.last30d,
          'alltime': analytics.totals,
        }
        const stats = statsMap[interval]
        return (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Statistici</p>
              <div className="flex gap-1">
                {INTERVALS.map((iv) => (
                  <button
                    key={iv.key}
                    onClick={() => setInterval(iv.key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      interval === iv.key
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {iv.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <KpiCard label="Revenue" value={formatMoney(stats.revenue, currency)} />
              <KpiCard label="Unități vândute" value={String(stats.unitsSold)} />
              <KpiCard label="Comenzi" value={String(stats.orders)} />
            </div>
          </div>
        )
      })()}

      {/* Monthly chart */}
      {analyticsLoading ? (
        <SectionSkeleton h="h-48" />
      ) : analytics && analytics.monthlySales.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Revenue lunar (12 luni)</h2>
          <div className="flex items-end gap-2 h-36">
            {(() => {
              const max = Math.max(...analytics.monthlySales.map((m) => m.revenue), 1)
              return analytics.monthlySales.map((m) => (
                <div key={m.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  {m.revenue > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{m.revenue.toFixed(0)}</span>
                  )}
                  <div
                    className="w-full rounded-t-md bg-indigo-500 dark:bg-indigo-600 transition-all"
                    style={{ height: `${Math.max((m.revenue / max) * 112, m.revenue > 0 ? 4 : 2)}px` }}
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500">{m.month.slice(5)}</span>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {/* Variant stats */}
      {analyticsLoading ? (
        <SectionSkeleton />
      ) : analytics && (() => {
        const vsMap: Record<Interval, VariantStat[]> = {
          '7z': analytics.variantStats.last7d,
          '14z': analytics.variantStats.last14d,
          '30z': analytics.variantStats.last30d,
          'alltime': analytics.variantStats.alltime,
        }
        const vs = vsMap[interval]
        return (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Performanță variante</h2>
            </div>
            {vs.every((v) => v.unitsSold === 0) ? (
              <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">Nicio vânzare înregistrată.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Variantă</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">SKU</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Preț</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Unități</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Revenue</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Top oraș</th>
                      <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Top țară</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {vs.map((v) => (
                      <tr
                        key={v.catalogVariantId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer"
                        onClick={() => navigate(`/products/store/${sp.id}/variants/${v.catalogVariantId}`)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{v.title}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400 dark:text-gray-500">{v.sku}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-gray-400">{formatMoney(v.effectivePrice, currency)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{v.unitsSold}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100">{formatMoney(v.revenue, currency)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {v.topCity ? <span title={`${v.topCityOrders} comenzi`}>{v.topCity}</span> : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {v.topCountry ? <span title={`${v.topCountryOrders} comenzi`}>{v.topCountry}</span> : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })()}

      {/* Geo + Buyers */}
      {analyticsLoading ? (
        <SectionSkeleton h="h-48" />
      ) : analytics && (() => {
        const intervalKey = interval === '7z' ? 'last7d' : interval === '14z' ? 'last14d' : interval === '30z' ? 'last30d' : 'alltime'
        const geo = analytics.geo[intervalKey]
        const buyers = analytics.buyers[intervalKey]
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top cities */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top orașe</p>
              {geo.cities.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Date insuficiente.</p>
              ) : (
                <div className="space-y-2">
                  {geo.cities.map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                      <span className="text-sm font-medium tabular-nums text-gray-500 dark:text-gray-400">{c.orders} comenzi</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top countries */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top țări</p>
              {geo.countries.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Date insuficiente.</p>
              ) : (
                <div className="space-y-2">
                  {geo.countries.map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                      <span className="text-sm font-medium tabular-nums text-gray-500 dark:text-gray-400">{c.orders} comenzi</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buyers */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cumpărători</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Clienți unici</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{buyers.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Cumpărători repetați</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{buyers.repeatBuyers}</span>
                    <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({buyers.repeatRate}%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">LTV mediu</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatMoney(buyers.avgBuyerLtv, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Frequently bought together */}
      {!analyticsLoading && analytics && analytics.frequentlyBoughtWith.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Frecvent cumpărate împreună</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produs</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Comenzi împreună</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {analytics.frequentlyBoughtWith.map((p) => (
                <tr
                  key={p.storeProductId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => navigate(`/products/store/${p.storeProductId}`)}
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.title}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100">{p.coOrders}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shipping cost */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Cost livrare</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Se aplică automat în storefront.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            step="0.01"
            value={shippingCost ?? String(sp.shippingCost ?? 0)}
            onChange={(e) => setShippingCost(e.target.value)}
            className="w-40 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">{currency}</span>
          <button
            disabled={savingShipping || shippingCost === null}
            onClick={async () => {
              if (shippingCost === null) return
              setSavingShipping(true)
              try {
                await updateProduct({ shippingCost: parseFloat(shippingCost) || 0 })
                setShippingCost(null)
              } finally {
                setSavingShipping(false)
              }
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            {savingShipping ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>

      {/* Variant pricing */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prețuri variante</h2>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            Preț custom per variantă. Dacă nu e setat, se folosește prețul sugerat din catalog.
          </p>
        </div>
        <StoreProductVariantPricing
          storeProductId={sp.id}
          catalogVariants={product?.variants ?? []}
          storeVariants={variants}
        />
      </div>
    </div>
  )
}
