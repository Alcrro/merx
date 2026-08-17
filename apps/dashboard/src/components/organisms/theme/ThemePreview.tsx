import { useState } from 'react'
import { storefrontUrl } from '../../../lib/storefront'

type ViewMode = 'mobile' | 'desktop'

interface ThemePreviewProps {
  storeSlug: string
  draftId: string
  reloadKey: number
}

export function ThemePreview({ storeSlug, draftId, reloadKey }: ThemePreviewProps) {
  const [mode, setMode] = useState<ViewMode>('mobile')
  const baseUrl = storefrontUrl(storeSlug)
  const previewUrl = `${baseUrl}?previewId=${encodeURIComponent(draftId)}`

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[200px]">{previewUrl}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('mobile')}
            title="Vizualizare mobilă"
            className={`p-1.5 rounded-lg transition-colors ${
              mode === 'mobile'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="7" y="2" width="10" height="20" rx="2" strokeWidth="2" />
              <circle cx="12" cy="19" r="0.5" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={() => setMode('desktop')}
            title="Vizualizare desktop"
            className={`p-1.5 rounded-lg transition-colors ${
              mode === 'desktop'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="14" rx="2" strokeWidth="2" />
              <path d="M8 22h8M12 18v4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Deschide în tab nou"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeWidth="2" strokeLinecap="round" />
              <path d="M15 3h6v6M10 14L21 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto flex items-start justify-center py-4">
        <div
          className={`bg-white shadow-lg transition-all duration-300 ${
            mode === 'mobile' ? 'w-[390px] rounded-2xl overflow-hidden' : 'w-full max-w-5xl'
          }`}
          style={{ minHeight: '600px' }}
        >
          <iframe
            key={reloadKey}
            src={previewUrl}
            title="Previzualizare storefront"
            className="w-full border-0"
            style={{ height: '800px' }}
          />
        </div>
      </div>
    </div>
  )
}
