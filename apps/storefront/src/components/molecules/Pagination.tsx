'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  page: number
  totalPages: number
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function go(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-3">
      <button
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Anterior
      </button>
      <span className="text-sm text-gray-500">
        Pagina {page} din {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => go(page + 1)}
        className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Următor →
      </button>
    </div>
  )
}
