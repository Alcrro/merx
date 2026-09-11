import { useState } from 'react'
import type { Order } from '@merx/types'
import { formatMoney } from '../../../lib/format'
import { Button } from '../../atoms/Button'

interface RefundModalProps {
  order: Order
  onClose: () => void
  onConfirm: (amount?: number) => void
  isLoading: boolean
}

function RefundModal({ order, onClose, onConfirm, isLoading }: RefundModalProps) {
  const [type, setType] = useState<'full' | 'partial'>('full')
  const [rawAmount, setRawAmount] = useState('')
  const [error, setError] = useState('')

  const partialAmount = parseFloat(rawAmount)
  const isValidPartial = !isNaN(partialAmount) && partialAmount > 0 && partialAmount <= order.total

  const handleConfirm = () => {
    if (type === 'partial') {
      if (!isValidPartial) {
        setError(`Suma trebuie să fie între 0.01 și ${order.total} ${order.currency}`)
        return
      }
      onConfirm(partialAmount)
    } else {
      onConfirm(undefined)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-fg-primary mb-1">
          Rambursare comandă #{order.orderNumber}
        </h3>
        <p className="text-sm text-fg-secondary mb-5">
          Total comandă: <span className="font-medium text-fg-primary">{formatMoney(order.total, order.currency)}</span>
        </p>

        <div className="space-y-3 mb-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={type === 'full'}
              onChange={() => { setType('full'); setError('') }}
              className="h-4 w-4 text-indigo-600"
            />
            <div>
              <p className="text-sm font-medium text-fg-primary">Rambursare totală</p>
              <p className="text-xs text-fg-muted">{formatMoney(order.total, order.currency)} returnat clientului</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={type === 'partial'}
              onChange={() => { setType('partial'); setError('') }}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-fg-primary">Rambursare parțială</p>
              {type === 'partial' && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.01"
                      max={order.total}
                      step="0.01"
                      value={rawAmount}
                      onChange={(e) => { setRawAmount(e.target.value); setError('') }}
                      placeholder={`Max ${order.total}`}
                      className="w-full input-compact"
                    />
                    <span className="text-sm text-fg-muted shrink-0">{order.currency}</span>
                  </div>
                  {error && <p className="mt-1 text-xs text-danger-text">{error}</p>}
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>Anulează</Button>
          <Button onClick={handleConfirm} isLoading={isLoading}>
            Confirmă rambursarea
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RefundModal
