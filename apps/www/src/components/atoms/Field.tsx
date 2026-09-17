interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  name: string
}

export function Field({ label, id, name, ...props }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-fg-muted">
        {label}
      </label>
      <input
        id={id}
        name={name}
        className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition-colors"
        {...props}
      />
    </div>
  )
}
