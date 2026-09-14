import type { InputHTMLAttributes } from 'react'
import { Field } from '../primitives/Field'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className, required, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <input
        id={inputId}
        required={required}
        className={[
          'input-base',
          error ? 'input-error' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
    </Field>
  )
}
