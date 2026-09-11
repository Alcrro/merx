import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'

export interface ButtonBaseProps {
  children: ReactNode
  isLoading?: boolean
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
}

export type AsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & { to?: never; href?: never }

export type AsLink = ButtonBaseProps & { to: string; href?: never; disabled?: boolean }

export type AsAnchor = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & { to?: never; href: string }

export type ButtonProps = AsButton | AsLink | AsAnchor
