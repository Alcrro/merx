'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/Button'
import { ChevronIcon } from '@/components/atoms/ChevronIcon'
import { useNavDropdown } from '@/hooks/useNavDropdown'
import { NavDropdownPanel } from './NavDropdownPanel'

export interface DropdownItem {
  label: string
  href: string
  description?: string
  icon?: React.ReactNode
}

interface NavDropdownProps {
  label: string
  items: DropdownItem[]
}

export function NavDropdown({ label, items }: NavDropdownProps) {
  const { open, setOpen, ref, mounted, visible } = useNavDropdown()

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        aria-expanded={open}
        aria-controls={`nav-dropdown-${label}`}
        onClick={() => setOpen((v) => !v)}
        className="text-fg hover:text-fg"
      >
        {label}
        <ChevronIcon className={cn('transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')} />
      </Button>

      {mounted && (
        <NavDropdownPanel
          id={`nav-dropdown-${label}`}
          items={items}
          onClose={() => setOpen(false)}
          visible={visible}
        />
      )}
    </div>
  )
}
