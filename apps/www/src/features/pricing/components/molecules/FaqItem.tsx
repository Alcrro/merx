'use client'

import { PlusIcon } from '../atoms/PlusIcon'

interface FaqItemProps {
  id: string
  q: string
  a: string
  open: boolean
  onToggle: () => void
}

export function FaqItem({ id, q, a, open, onToggle }: FaqItemProps) {
  const panelId = `faq-panel-${id}`
  const triggerId = `faq-trigger-${id}`

  return (
    <div className={`rounded-xl bg-surface-elevated transition-all duration-300 ${open ? 'shadow-[0_0_28px_rgba(99,102,241,0.18)]' : 'shadow-[0_0_16px_rgba(0,0,0,0.07)]'}`}>
      <button
        id={triggerId}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-6 px-5 py-4 text-left"
      >
        <span className={`text-sm font-semibold transition-colors ${open ? 'text-primary' : 'text-fg'}`}>
          {q}
        </span>
        <span
          aria-hidden="true"
          className={`flex-shrink-0 rounded-full w-6 h-6 flex items-center justify-center border transition-all duration-300 ${open ? 'border-primary bg-primary text-white rotate-45' : 'border-line text-fg-subtle'}`}
        >
          <PlusIcon />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm text-fg-muted leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  )
}
