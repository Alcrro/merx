export function SsoError() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5 max-w-xs text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
          <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Conectare eșuată</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
            Codul a expirat sau a fost deja folosit. Încearcă din nou.
          </p>
        </div>
        <a
          href="/login"
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
        >
          Înapoi la autentificare
        </a>
      </div>
    </div>
  )
}
