interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  id: string
  name: string
  children: React.ReactNode
}

export function SelectField({ label, id, name, children, ...props }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-fg-muted">
        {label}
      </label>
      <select
        id={id}
        name={name}
        className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition-colors"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
