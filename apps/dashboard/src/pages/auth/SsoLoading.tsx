import { Spinner } from '../../components/atoms/Spinner'

export function SsoLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="h-12 w-12 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center">
          <span className="text-lg font-bold tracking-tight text-white dark:text-gray-900">M</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-5 w-5" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Se conectează contul</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Un moment...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
