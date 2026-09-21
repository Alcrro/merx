'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from './Button'
import { SunIcon } from './SunIcon'
import { MoonIcon } from './MoonIcon'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-9 w-9" />

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        document.documentElement.classList.add('theme-transitioning')
        setTheme(isDark ? 'light' : 'dark')
        setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 300)
      }}
      aria-label={`Activează tema ${isDark ? 'luminoasă' : 'întunecată'}`}
      aria-pressed={isDark}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
