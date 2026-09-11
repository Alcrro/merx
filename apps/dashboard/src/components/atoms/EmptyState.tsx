interface EmptyStateProps {
  message: string
  hint?: string
}

function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  )
}

export default EmptyState
