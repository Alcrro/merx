import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RevenueChartPoint } from '@merx/types'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  data?: RevenueChartPoint[]
  fmt: Intl.NumberFormat
  isLoading: boolean
}

export function RevenueChart({ data, fmt, isLoading }: Props) {
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
    label: new Date(p.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }),
  }))

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Venit zilnic</p>
      {isLoading ? (
        <div className="h-[220px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
      ) : formatted.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-sm text-gray-400 dark:text-gray-500">
          Nu există date pentru această perioadă.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={formatted} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(v) => [typeof v === 'number' ? fmt.format(v) : v, 'Venit']}
              contentStyle={{
                borderRadius: '12px',
                border: `1px solid ${colors.tooltipBorder}`,
                fontSize: 12,
                backgroundColor: colors.tooltipBg,
                color: colors.tooltipText,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
