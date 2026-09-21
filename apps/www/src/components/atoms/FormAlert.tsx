interface FormAlertProps {
  variant: 'error' | 'success'
  message: string
}

export function FormAlert({ variant, message }: FormAlertProps) {
  const styles = variant === 'error'
    ? 'bg-error/10 border-error/20 text-error'
    : 'bg-success/10 border-success/20 text-success'

  return (
    <div className={`rounded-xl border px-4 py-3 ${styles}`}>
      <p className="text-xs">{message}</p>
    </div>
  )
}
