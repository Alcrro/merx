interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'sale'
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  sale: 'bg-red-100 text-red-700',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
