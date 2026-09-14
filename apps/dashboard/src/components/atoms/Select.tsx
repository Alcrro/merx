import { useState } from 'react'
import { DropdownBase } from '../primitives/DropdownBase'
import { Field } from '../primitives/Field'

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  error?: string
  hint?: string
  disabled?: boolean
  className?: string
}

export function Select({ label, value, onChange, options, error, hint, disabled, className }: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  function select(v: string) {
    onChange(v)
    setOpen(false)
  }

  return (
    <Field label={label} error={error} hint={hint} className={className}>
      <DropdownBase
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
        error={!!error}
        trigger={
          <span className={selected ? 'text-fg-primary' : 'text-fg-muted'}>
            {selected?.label ?? '—'}
          </span>
        }
      >
        <ul className="max-h-60 overflow-y-auto py-1">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => select(opt.value)}
                className={[
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  opt.value === value
                    ? 'bg-brand-subtle text-brand-text font-medium'
                    : 'text-fg-secondary hover:bg-surface-hover',
                ].join(' ')}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </DropdownBase>
    </Field>
  )
}
