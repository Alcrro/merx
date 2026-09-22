'use client'

import { useEffect, useState } from 'react'

export function NavbarShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-200 ${
        scrolled
          ? 'bg-surface/95 backdrop-blur-md border-b border-line'
          : 'bg-[var(--color-surface-nav)] border-b border-line'
      }`}
    >
      {children}
    </header>
  )
}
