import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { CustomerAnalytics } from '@merx/types'
import { useTheme } from '../../../hooks/useTheme'

interface Props {
  data?: CustomerAnalytics['monthlySpend']
  fmt: Intl.NumberFormat
  isLoading: boolean
}

export function CustomerSpendChart({ data, fmt, isLoading }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const colors = {
    grid: isDark ? '#374151' : '#f3f4f6',
    tick: isDark ? '#6b7280' : '#9ca3af',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
    tooltipText: isDark ? '#f3f4f6' : '#111827',
  }

  const formatted = (data ?? []).map((p) => ({
    ...p,
    label: new Date(`${p.month}-01`).toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' }),
  }))

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Cheltuieli lunare (12 luni)</p>
      {isLoading ? (
        <div className="h-[220px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={formatted} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: colors.tick }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) => (typeof v === 'number' ? fmt.format(v) : String(v))}
              tick={{ fontSize: 11, fill: colors.tick }}
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <Tooltip
              formatter={(v) => [typeof v === 'number' ? fmt.format(v) : v, 'Cheltuieli']}
              contentStyle={{
                borderRadius: '12px',
                border: `1px solid ${colors.tooltipBorder}`,
                fontSize: 12,
                backgroundColor: colors.tooltipBg,
                color: colors.tooltipText,
              }}
            />
            <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
