import { cva, type VariantProps } from 'class-variance-authority'

export const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:     'bg-primary text-primary-fg hover:bg-primary-hover shadow-sm',
        secondary:   'bg-surface-subtle text-fg hover:bg-surface-elevated',
        ghost:       'text-fg-muted hover:text-fg hover:bg-surface-subtle',
        outline:     'border border-line-strong text-fg-muted hover:bg-surface-subtle',
        destructive: 'bg-error text-primary-fg hover:opacity-90 shadow-sm',
        link:        'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm:   'h-8 px-3 text-xs',
        md:   'h-10 px-4 text-sm',
        lg:   'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export type ButtonVariants = VariantProps<typeof button>
