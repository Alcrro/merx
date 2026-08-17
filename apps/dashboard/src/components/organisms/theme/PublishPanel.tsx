import type { ThemeVersion, ContrastCheckResult } from '@merx/api-client'
import { Button } from '../../atoms/Button'

interface PublishPanelProps {
  draft: ThemeVersion | null
  published: ThemeVersion | null
  contrast: ContrastCheckResult | null
  isPublishing: boolean
  isRollingBack: boolean
  onPublish: (force: boolean) => void
  onRollback: (versionId: string) => void
}

export function PublishPanel({
  draft,
  published,
  contrast,
  isPublishing,
  isRollingBack,
  onPublish,
  onRollback,
}: PublishPanelProps) {
  const hasContrastFail = contrast !== null && !contrast.allPass
  const canRollback = published !== null && draft?.id !== published.id

  return (
    <div className="flex flex-col gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
      {/* Version info */}
      {draft && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Draft curent</span>
          <span className="font-mono">{draft.id.slice(0, 8)}</span>
        </div>
      )}

      {/* Contrast warnings */}
      {hasContrastFail && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
            Contrast sub WCAG AA
          </p>
          <ul className="flex flex-col gap-1">
            {contrast!.pairs
              .filter((p) => !p.passAA)
              .map((p) => (
                <li key={p.label} className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
                  <span>{p.label}</span>
                  <span className="font-mono">{p.ratio.toFixed(2)}:1</span>
                </li>
              ))}
          </ul>
          <button
            onClick={() => onPublish(true)}
            disabled={isPublishing}
            className="mt-2 text-xs text-amber-600 dark:text-amber-400 underline hover:no-underline disabled:opacity-50"
          >
            Publică oricum (override conștient)
          </button>
        </div>
      )}

      {/* Publish button */}
      <Button
        onClick={() => onPublish(false)}
        disabled={!draft || isPublishing}
        className="w-full"
      >
        {isPublishing ? 'Se publică…' : 'Publică tema'}
      </Button>

      {/* Rollback */}
      {canRollback && (
        <button
          onClick={() => onRollback(published!.id)}
          disabled={isRollingBack}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline text-center disabled:opacity-50"
        >
          {isRollingBack ? 'Se revine…' : `Revino la versiunea publicată (${published!.id.slice(0, 8)})`}
        </button>
      )}
    </div>
  )
}
