import { cva, type VariantProps } from 'class-variance-authority'

export const navButton = cva(
  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        ghost:   'text-fg-muted hover:text-fg hover:bg-surface-subtle',
        primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

export type NavButtonVariants = VariantProps<typeof navButton>
