import type { CustomerWithStats } from '@merx/types'
import { RFMBadge } from './RFMBadge'

type RFM = CustomerWithStats['rfm']

const RFM_ROWS = [
  { key: 'r', label: 'Recency', hint: 'Cât de recent a cumpărat' },
  { key: 'f', label: 'Frequency', hint: 'Cât de des cumpără' },
  { key: 'm', label: 'Monetary', hint: 'Cât cheltuiește' },
] as const

export function CustomerRFMCard({ rfm }: { rfm: RFM }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Scor RFM</p>
        <RFMBadge segment={rfm.segment} size="md" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {RFM_ROWS.map(({ key, label, hint }) => (
          <div key={key} className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 dark:border-gray-800 py-4">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{rfm[key]}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">/5</span>
            <span className="mt-1 text-xs text-center text-gray-400 dark:text-gray-500 px-2">{hint}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
