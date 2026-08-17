import { Button } from '../../atoms/Button'
import { Spinner } from '../../atoms/Spinner'

interface Props {
  message: string
  hasError: boolean
  errorMessage: string
  onRetry: () => void
}

export function ConnectRedirectScreen({ message, hasError, errorMessage, onRetry }: Props) {
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-red-500 dark:text-red-400">{errorMessage}</p>
        <Button onClick={onRetry}>Încearcă din nou</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  )
}
