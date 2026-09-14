export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-padded">
      <p className="text-xs text-fg-muted mb-1">{label}</p>
      <p className="text-xl font-semibold text-fg-primary">{value}</p>
    </div>
  )
}
