import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ProductAnalytics } from '@merx/types'
import { useTheme } from '../../../hooks/useTheme'

interface Props {
  data?: ProductAnalytics['monthlySales']
  fmt: Intl.NumberFormat
  isLoading: boolean
}

export function ProductSalesChart({ data, fmt, isLoading }: Props) {
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
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Vânzări lunare (12 luni)</p>
      {isLoading ? (
        <div className="h-[240px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: colors.tick }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tickFormatter={(v) => (typeof v === 'number' ? fmt.format(v) : String(v))}
              tick={{ fontSize: 11, fill: colors.tick }}
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <YAxis
              yAxisId="units"
              orientation="right"
              tickFormatter={(v) => (typeof v === 'number' ? `${v} buc` : String(v))}
              tick={{ fontSize: 11, fill: colors.tick }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: `1px solid ${colors.tooltipBorder}`,
                fontSize: 12,
                backgroundColor: colors.tooltipBg,
                color: colors.tooltipText,
              }}
              formatter={(value, name) => {
                if (name === 'revenue') return [typeof value === 'number' ? fmt.format(value) : value, 'Revenue']
                if (name === 'unitsSold') return [value, 'Unități']
                return [value, name]
              }}
            />
            <Legend
              formatter={(value) => value === 'revenue' ? 'Revenue' : 'Unități vândute'}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Bar yAxisId="revenue" dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="revenue" />
            <Line yAxisId="units" dataKey="unitsSold" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="unitsSold" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
