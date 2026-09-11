function pct(closed: number, total: number) {
  if (total === 0) return 0
  return Math.round((closed / total) * 100)
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
    </div>
  )
}

interface Props {
  total: number
  closed: number
  open: number
}

export function MvpSummaryCards({ total, closed, open }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card label="Total" value={total} />
      <Card label="Rezolvate" value={closed} />
      <Card label="Rămase" value={open} />
      <Card label="Progres" value={`${pct(closed, total)}%`} />
    </div>
  )
}
