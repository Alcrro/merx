import { useRef, useState } from 'react'
import type { ProductImage } from '@merx/types'
import { Button } from '../../atoms/Button'

interface ImageUploaderProps {
  images: ProductImage[]
  onUpload: (file: File) => Promise<void>
  onDelete: (imageId: string) => Promise<void>
  isUploading?: boolean
  isDeleting?: boolean
}

export function ImageUploader({ images, onUpload, onDelete, isUploading, isDeleting }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    await onUpload(files[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId)
    try {
      await onDelete(imageId)
    } finally {
      setDeletingId(null)
    }
  }

  const canUpload = images.length < 10

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      {canUpload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={[
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition py-8 px-4 text-center',
            dragOver
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800/50',
          ].join(' ')}
        >
          <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isUploading ? (
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Se încarcă...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">Click</span> sau trage o imagine aici
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">JPEG, PNG, WebP · max 5MB · {images.length}/10</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Grid imagini */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <img
                src={img.url}
                alt={img.altText ?? ''}
                className="h-full w-full object-cover"
              />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                  Cover
                </span>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                disabled={isDeleting || deletingId === img.id}
                className="absolute top-1 right-1 rounded-md bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId === img.id ? (
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}

          {/* Slot upload inline când există deja imagini și mai e loc */}
          {canUpload && images.length > 0 && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-indigo-500 disabled:opacity-50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      )}

      {!canUpload && (
        <p className="text-xs text-gray-400 dark:text-gray-500">Limită atinsă — maxim 10 imagini per produs.</p>
      )}
    </div>
  )
}
