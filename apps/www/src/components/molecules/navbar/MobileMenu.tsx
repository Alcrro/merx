'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/atoms/Button'
import { CloseIcon } from '@/components/atoms/CloseIcon'
import { HamburgerIcon } from '@/components/atoms/HamburgerIcon'
import { MobileMenuDialog } from './MobileMenuDialog'
import { useMobileMenu } from '@/hooks/useMobileMenu'
import type { NavItem } from '@/config/nav'
import type { WwwUser } from '@/services/session'

interface MobileMenuProps {
  items: readonly NavItem[]
  dashboardUrl: string
  user: WwwUser | null
}

export function MobileMenu({ items, dashboardUrl, user }: MobileMenuProps) {
  const { open, setOpen, expanded, setExpanded, triggerRef, dialogRef } = useMobileMenu()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const dialog = open ? (
    <MobileMenuDialog
      dialogRef={dialogRef}
      items={items}
      dashboardUrl={dashboardUrl}
      user={user}
      expanded={expanded}
      setExpanded={setExpanded}
      onClose={() => setOpen(false)}
    />
  ) : null

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-label={open ? 'Închide meniu' : 'Deschide meniu'}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden"
      >
        {open ? <CloseIcon /> : <HamburgerIcon />}
      </Button>

      {mounted && createPortal(dialog, document.body)}
    </>
  )
}
