import { useState } from 'react'
import type { AIInsight } from '@merx/api-client'
import { useInsights, useRunInsights, useRestockInsight, useInsightsHistory } from '../../../hooks/useInsights'

const severityConfig = {
  critical: {
    bar: 'bg-red-500',
    badge: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    label: 'Critic',
  },
  warning: {
    bar: 'bg-amber-400',
    badge: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    label: 'Atenție',
  },
  info: {
    bar: 'bg-blue-400',
    badge: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    label: 'Info',
  },
}

export function AIInsightsWidget() {
  const { data: insights = [], isLoading } = useInsights()
  const { mutate: runInsights, isPending } = useRunInsights()
  const [restockTarget, setRestockTarget] = useState<AIInsight | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const { data: history = [], isLoading: historyLoading } = useInsightsHistory(showHistory)

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Insights</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Analiză automată trend + stoc</p>
          </div>
          <button
            onClick={() => runInsights()}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition disabled:opacity-50"
          >
            {isPending ? (
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            Analizează acum
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
              <svg className="h-5 w-5 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Totul e în ordine</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Niciun alert activ momentan</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onRestock={() => setRestockTarget(insight)}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition pt-1"
        >
          <svg
            className={`h-3 w-3 transition-transform ${showHistory ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Istoric analize
        </button>

        {showHistory && (
          <div className="flex flex-col gap-1.5 border-t border-gray-100 dark:border-gray-800 pt-3">
            {historyLoading ? (
              <div className="h-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : history.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">Niciun istoric disponibil</p>
            ) : (
              history.map((item) => <HistoryRow key={item.id} insight={item} />)
            )}
          </div>
        )}
      </div>

      {restockTarget && (
        <RestockModal
          insight={restockTarget}
          onClose={() => setRestockTarget(null)}
        />
      )}
    </>
  )
}

function InsightCard({ insight, onRestock }: { insight: AIInsight; onRestock: () => void }) {
  const cfg = severityConfig[insight.severity]
  const canRestock = insight.type === 'trending_stockout' || insight.type === 'trending_low_stock'

  return (
    <div className="relative flex gap-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 p-3 overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-lg`} />
      <div className="ml-1 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug">{insight.title}</p>
          <span className={`shrink-0 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        {insight.description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{insight.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          {insight.data && (
            <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
              <span>{insight.data.velocityRecent.toFixed(1)} unit/zi</span>
              {insight.data.runwayDays !== null && insight.data.runwayDays > 0 && (
                <span>stoc {insight.data.runwayDays} zile</span>
              )}
              {insight.data.recommendedOrder > 0 && (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">rec. {insight.data.recommendedOrder} buc.</span>
              )}
            </div>
          )}
          {canRestock && (
            <button
              onClick={onRestock}
              className="shrink-0 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-indigo-700 transition"
            >
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" />
              </svg>
              Reaprovizionează
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const typeLabel: Record<string, string> = {
  trending_stockout: 'Stoc epuizat',
  trending_low_stock: 'Stoc critic',
  slow_overstock: 'Suprastoc',
}

function HistoryRow({ insight }: { insight: AIInsight }) {
  const cfg = severityConfig[insight.severity]
  const date = insight.resolvedAt
    ? new Date(insight.resolvedAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })
    : new Date(insight.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })

  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.bar}`} />
      <p className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{insight.data?.productTitle ?? insight.title}</p>
      <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">{typeLabel[insight.type] ?? insight.type}</span>
      <span className="shrink-0 text-[10px] text-gray-300 dark:text-gray-600">{date}</span>
    </div>
  )
}

function RestockModal({ insight, onClose }: { insight: AIInsight; onClose: () => void }) {
  const recommended = insight.data?.recommendedOrder ?? 1
  const [quantity, setQuantity] = useState(String(recommended))
  const { mutate: restock, isPending } = useRestockInsight()

  const qty = parseInt(quantity, 10)
  const isValid = !isNaN(qty) && qty >= 1

  const handleConfirm = () => {
    if (!isValid || isPending) return
    restock(
      { insightId: insight.id, quantity: qty },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reaprovizionează stoc</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{insight.data?.productTitle}</p>

        <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Stoc curent</span>
            <span className="font-medium">{insight.data?.totalStock ?? 0} buc.</span>
          </div>
          <div className="flex justify-between">
            <span>Viteză vânzări</span>
            <span className="font-medium">{insight.data?.velocityRecent.toFixed(1)} buc./zi</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
            <span>Recomandat pentru 30 zile</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{recommended} buc.</span>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Cantitate de adăugat la stoc
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            autoFocus
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Anulează
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || isPending}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Se salvează...' : `Confirmă ${isValid ? qty : ''} buc.`}
          </button>
        </div>
      </div>
    </div>
  )
}
