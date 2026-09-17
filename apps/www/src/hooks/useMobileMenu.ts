'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'

export function useMobileMenu() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Returnează focusul pe trigger la închidere — a11y
  useEffect(() => {
    if (!open) triggerRef.current?.focus()
  }, [open])

  // Focus trap + Escape în dialog
  useLayoutEffect(() => {
    if (!open || !dialogRef.current) return

    const el = dialogRef.current
    const focusables = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
    focusables[0]?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key !== 'Tab' || focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return { open, setOpen, expanded, setExpanded, triggerRef, dialogRef }
}
