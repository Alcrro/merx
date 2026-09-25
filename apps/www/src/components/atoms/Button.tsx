import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { button, type ButtonVariants } from '../styles/button.styles'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  children: React.ReactNode
  ref?: React.Ref<HTMLButtonElement>
  href?: string
}

export function Button({
  variant,
  size,
  children,
  className,
  ref,
  type = 'button',
  href,
  ...props
}: ButtonProps) {
  const cls = cn(button({ variant, size }), className)

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }

  return (
    <button ref={ref} type={type} className={cls} {...props}>
      {children}
    </button>
  )
}
