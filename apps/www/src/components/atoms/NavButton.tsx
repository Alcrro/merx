import Link from 'next/link'
import { navButton } from '@/components/styles/nav-button.styles'
import type { NavButtonVariants } from '@/components/styles/nav-button.styles'

interface NavButtonProps extends NavButtonVariants {
  href: string
  children: React.ReactNode
  prefetch?: boolean
}

export function NavButton({ href, variant, children, prefetch }: NavButtonProps) {
  return (
    <Link href={href} className={navButton({ variant })} prefetch={prefetch}>
      {children}
    </Link>
  )
}
