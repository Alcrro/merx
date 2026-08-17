import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CatalogProduct, StoreProduct } from '@merx/api-client'
import { useAddToStore } from '../../../hooks/useCatalog'
import { useAuth } from '../../../hooks/useAuth'
import { formatMoney } from '../../../lib/format'

interface Props {
  product: CatalogProduct
  myProducts: StoreProduct[]
}

export function CatalogTableRow({ product, myProducts }: Props) {
  const navigate = useNavigate()
  const { store } = useAuth()
  const currency = store?.currency ?? 'EUR'
  const addToStore = useAddToStore()

  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const variants = product.variants ?? []
  const storeProduct = myProducts.find((sp) => sp.catalogProductId === product.id)
  const activeVariantIds = new Set((storeProduct?.variants ?? []).map((v) => v.catalogVariantId))
  const inactiveVariants = variants.filter((v) => !activeVariantIds.has(v.id))

  function toggleVariant(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(inactiveVariants.map((v) => v.id)))
  }

  async function handleAdd() {
    if (selected.size === 0) return
    await addToStore.mutateAsync({ catalogProductId: product.id, variantIds: [...selected] })
    setSelected(new Set())
    if (!storeProduct) setExpanded(false)
  }

  const isLoading = addToStore.isPending

  return (
    <>
      {/* Main row */}
      <tr
        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3.5">
          <p className="font-medium text-gray-900 dark:text-gray-100 leading-tight">{product.title}</p>
          {product.description && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-1 max-w-xs">{product.description}</p>
          )}
        </td>
        <td className="px-4 py-3.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {product.category?.name ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
          </span>
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            {storeProduct ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-950 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 2.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 7.586l5.293-5.293z" clipRule="evenodd" />
                </svg>
                {activeVariantIds.size}/{variants.length} variante
              </span>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">{variants.length} variante</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3.5 text-right">
          <svg
            className={`ml-auto h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </td>
      </tr>

      {/* Expanded panel */}
      {expanded && (
        <tr>
          <td colSpan={4} className="px-4 pb-4 pt-0">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 p-4">
              {variants.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Nicio variantă disponibilă.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {variants.map((v) => {
                      const isActive = activeVariantIds.has(v.id)
                      const isSelected = selected.has(v.id)
                      return (
                        <button
                          key={v.id}
                          disabled={isActive}
                          onClick={(e) => { e.stopPropagation(); toggleVariant(v.id) }}
                          className={[
                            'relative flex flex-col items-start rounded-lg border p-3 text-left transition-all',
                            isActive
                              ? 'border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-950/40 cursor-default'
                              : isSelected
                              ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600',
                          ].join(' ')}
                        >
                          {/* Checkbox / check icon */}
                          <div className="mb-2 flex w-full items-center justify-between">
                            {isActive ? (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                                <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                                  <path fillRule="evenodd" d="M10.293 2.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 7.586l5.293-5.293z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              <span className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                {isSelected && (
                                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 2.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 7.586l5.293-5.293z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[10px] font-medium text-green-600 dark:text-green-400">activ</span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">{v.title}</p>
                          <p className="mt-0.5 text-xs font-mono text-gray-400 dark:text-gray-500">{v.sku}</p>
                          <p className="mt-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">{formatMoney(v.suggestedPrice, currency)}</p>
                        </button>
                      )
                    })}
                  </div>

                  {inactiveVariants.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={(e) => { e.stopPropagation(); selectAll() }}
                        className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                      >
                        Selectează toate variantele noi
                      </button>
                      <div className="flex items-center gap-2">
                        {storeProduct && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/products/store/${storeProduct.id}`) }}
                            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                          >
                            Gestionează →
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); void handleAdd() }}
                          disabled={selected.size === 0 || isLoading}
                          className={[
                            'rounded-lg px-4 py-1.5 text-sm font-medium transition',
                            selected.size > 0 && !isLoading
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed',
                          ].join(' ')}
                        >
                          {isLoading
                            ? 'Se adaugă...'
                            : selected.size > 0
                            ? `Adaugă ${selected.size} ${selected.size === 1 ? 'variantă' : 'variante'}`
                            : 'Selectează variante'}
                        </button>
                      </div>
                    </div>
                  )}

                  {inactiveVariants.length === 0 && storeProduct && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Toate variantele sunt active în store-ul tău.</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/products/store/${storeProduct.id}`) }}
                        className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                      >
                        Gestionează →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
