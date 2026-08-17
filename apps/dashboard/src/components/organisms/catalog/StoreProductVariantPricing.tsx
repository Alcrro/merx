import { useState } from 'react'
import type { CatalogVariant, StoreProductVariant } from '@merx/api-client'
import { useUpdateVariantPrice, useAddVariantToStore, useRemoveVariantFromStore } from '../../../hooks/useCatalog'
import { useAuth } from '../../../hooks/useAuth'
import { formatMoney } from '../../../lib/format'
import { Button } from '../../atoms/Button'

interface RowProps {
  catalogVariant: CatalogVariant
  storeVariant: StoreProductVariant | undefined
  storeProductId: string
  currency: string
}

function VariantRow({ catalogVariant, storeVariant, storeProductId, currency }: RowProps) {
  const isActive = !!storeVariant
  const suggested = catalogVariant.suggestedPrice
  const [price, setPrice] = useState(
    storeVariant?.customPrice !== null && storeVariant?.customPrice !== undefined
      ? String(storeVariant.customPrice)
      : ''
  )
  const [dirty, setDirty] = useState(false)

  const addVariant = useAddVariantToStore(storeProductId)
  const removeVariant = useRemoveVariantFromStore(storeProductId)
  const { mutateAsync: updatePrice, isPending: savingPrice } = useUpdateVariantPrice(storeProductId)

  const parsedPrice = price.trim() === '' ? null : parseFloat(price.replace(',', '.'))
  const isValid = parsedPrice === null || (!isNaN(parsedPrice) && parsedPrice >= 0)
  const effectivePrice = parsedPrice !== null && !isNaN(parsedPrice) ? parsedPrice : suggested

  async function handleToggle() {
    if (isActive) {
      await removeVariant.mutateAsync(catalogVariant.id)
    } else {
      await addVariant.mutateAsync(catalogVariant.id)
      setPrice('')
      setDirty(false)
    }
  }

  async function handleSave() {
    if (!isValid) return
    await updatePrice({ catalogVariantId: catalogVariant.id, customPrice: parsedPrice })
    setDirty(false)
  }

  const toggling = addVariant.isPending || removeVariant.isPending

  return (
    <tr className={isActive ? '' : 'opacity-50'}>
      {/* Toggle */}
      <td className="px-4 py-3">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isActive ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
          } ${toggling ? 'opacity-50 cursor-wait' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isActive ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </td>
      {/* Variant name + SKU */}
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900 dark:text-gray-100">{catalogVariant.title}</p>
        <p className="text-xs font-mono text-gray-400 dark:text-gray-500">{catalogVariant.sku}</p>
      </td>
      {/* Suggested price */}
      <td className="px-4 py-3 tabular-nums text-gray-500 dark:text-gray-400">
        {formatMoney(suggested, currency)}
      </td>
      {/* Custom price input */}
      <td className="px-4 py-3">
        {isActive ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={0.01}
              value={price}
              placeholder={suggested.toFixed(2)}
              onChange={(e) => { setPrice(e.target.value); setDirty(true) }}
              className={[
                'w-28 rounded-lg border px-3 py-1.5 text-sm tabular-nums outline-none transition',
                'text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800',
                'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                !isValid ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-gray-700',
              ].join(' ')}
            />
            {dirty && (
              <Button size="sm" isLoading={savingPrice} disabled={!isValid} onClick={handleSave}>
                Salvează
              </Button>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
        )}
        {!isValid && <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">Preț invalid</p>}
      </td>
      {/* Effective price */}
      <td className="px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300 font-medium">
        {isActive ? (
          <>
            {formatMoney(effectivePrice, currency)}
            {parsedPrice !== null && !isNaN(parsedPrice) && parsedPrice !== suggested && (
              <span className="ml-1.5 text-xs text-indigo-500 dark:text-indigo-400">(custom)</span>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">inactiv</span>
        )}
      </td>
      {/* Reset */}
      <td className="px-4 py-3 text-right">
        {isActive && storeVariant?.customPrice !== null && !dirty && (
          <button
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition"
            onClick={async () => {
              setPrice('')
              await updatePrice({ catalogVariantId: catalogVariant.id, customPrice: null })
            }}
          >
            Resetează
          </button>
        )}
      </td>
    </tr>
  )
}

interface Props {
  storeProductId: string
  catalogVariants: CatalogVariant[]
  storeVariants: StoreProductVariant[]
}

export function StoreProductVariantPricing({ storeProductId, catalogVariants, storeVariants }: Props) {
  const { store } = useAuth()
  const currency = store?.currency ?? 'EUR'

  if (catalogVariants.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-gray-400 dark:text-gray-500">
        Nicio variantă disponibilă.
      </div>
    )
  }

  const storeVariantMap = new Map(storeVariants.map((v) => [v.catalogVariantId, v]))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Activ</th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Variantă</th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Preț sugerat</th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Preț custom</th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Preț efectiv</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {catalogVariants.map((cv) => (
            <VariantRow
              key={cv.id}
              catalogVariant={cv}
              storeVariant={storeVariantMap.get(cv.id)}
              storeProductId={storeProductId}
              currency={currency}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
