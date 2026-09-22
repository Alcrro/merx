'use client'

import { useState } from 'react'

interface FooterAccordionProps {
  label: string
  children: React.ReactNode
}

export function FooterAccordion({ label, children }: FooterAccordionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full py-3.5"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-fg-subtle">
          {label}
        </span>
        <svg
          className={`w-4 h-4 text-fg-subtle transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="pb-4 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
