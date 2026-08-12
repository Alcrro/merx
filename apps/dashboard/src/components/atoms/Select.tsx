import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, id, options, className, ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        id={selectId}
        className={[
          'rounded-lg border px-3 py-2 text-sm outline-none transition',
          'text-gray-900 dark:text-gray-100',
          'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          error
            ? 'border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-700'
            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
