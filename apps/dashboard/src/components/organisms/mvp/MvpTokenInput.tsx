import { useState } from 'react'

export function MvpTokenInput({ error }: { error: string }) {
  const [token, setToken] = useState('')

  function save() {
    if (!token.trim()) return
    localStorage.setItem('github_token', token.trim())
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub token necesar</p>
      <p className="text-xs text-gray-400 max-w-xs text-center">{error}</p>
      <div className="flex gap-2 w-full max-w-sm">
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="ghp_..."
          className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg outline-none border border-transparent focus:border-indigo-300 dark:focus:border-indigo-700 text-gray-700 dark:text-gray-300"
        />
        <button
          onClick={save}
          className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          Salvează
        </button>
      </div>
      <p className="text-xs text-gray-400">Settings → Developer → Fine-grained token → Issues: Read</p>
    </div>
  )
}
