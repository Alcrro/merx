import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { formatMoney, formatPercent } from '../../../lib/format'
import type { CreateDiscountInput, DiscountType } from '@merx/api-client'

interface Props {
  currency: string
  onSubmit: (data: CreateDiscountInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const PREVIEW_AMOUNT = 200

export function CreateDiscountForm({ currency, onSubmit, onCancel, isLoading }: Props) {
  const [code, setCode] = useState('')
  const [type, setType] = useState<DiscountType>('percentage')
  const [value, setValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState<string | null>(null)

  const numericValue = parseFloat(value) || 0

  const previewDiscount =
    numericValue > 0
      ? type === 'percentage'
        ? Math.min(Math.floor(PREVIEW_AMOUNT * (numericValue / 100) * 100) / 100, PREVIEW_AMOUNT)
        : Math.min(numericValue, PREVIEW_AMOUNT)
      : 0

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!code.trim()) { setError('Codul este obligatoriu'); return }
    if (numericValue <= 0) { setError('Valoarea trebuie să fie pozitivă'); return }
    if (type === 'percentage' && numericValue > 100) { setError('Procentul nu poate depăși 100%'); return }
    if (startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
      setError('Data de expirare trebuie să fie după data de start')
      return
    }

    const data: CreateDiscountInput = {
      code: code.trim().toUpperCase(),
      type,
      value: numericValue,
      ...(minOrderAmount ? { minOrderAmount: parseFloat(minOrderAmount) } : {}),
      ...(maxUses ? { maxUses: parseInt(maxUses, 10) } : {}),
      ...(startsAt ? { startsAt: new Date(startsAt).toISOString() } : {}),
      ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
    }

    try {
      await onSubmit(data)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Eroare la creare')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cod */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cod</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
          placeholder="ex: VARA26"
          maxLength={50}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Tip + Valoare */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tip</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DiscountType)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="percentage">Procentual (%)</option>
            <option value="fixed">Valoare fixă ({currency})</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valoare {type === 'percentage' ? '(%)' : `(${currency})`}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === 'percentage' ? '10' : '15.00'}
            min="0.01"
            max={type === 'percentage' ? '100' : undefined}
            step={type === 'percentage' ? '0.01' : '0.01'}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Preview live */}
      {previewDiscount > 0 && (
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300">
          La un coș de {formatMoney(PREVIEW_AMOUNT, currency)}, clientul economisește{' '}
          <strong>{formatMoney(previewDiscount, currency)}</strong> și plătește{' '}
          <strong>{formatMoney(PREVIEW_AMOUNT - previewDiscount, currency)}</strong>
          {type === 'percentage' && ` (${formatPercent(numericValue)} reducere)`}.
        </div>
      )}

      {/* Opționale */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Coș minim ({currency})
          </label>
          <input
            type="number"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            placeholder="Opțional"
            min="0.01"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max utilizări
          </label>
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Nelimitat"
            min="1"
            step="1"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valabil din</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiră la</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Anulează
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Se creează...' : 'Creează cod'}
        </Button>
      </div>
    </form>
  )
}
