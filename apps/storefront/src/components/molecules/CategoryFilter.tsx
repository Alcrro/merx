'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { PublicCategory } from '@/lib/api'

export function CategoryFilter({ categories }: { categories: PublicCategory[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('categoryId') ?? ''

  function select(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set('categoryId', id)
    } else {
      params.delete('categoryId')
    }
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => select('')}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          !active
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Toate
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => select(cat.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === cat.id
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
