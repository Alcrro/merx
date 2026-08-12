import { StoreSettingsForm } from '../../components/organisms/StoreSettingsForm'

export function StoreSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Setări magazin</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configurează moneda, fusul orar și limba magazinului tău.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <StoreSettingsForm />
      </div>
    </div>
  )
}
