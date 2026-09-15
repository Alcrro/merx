interface BadgeProps {
  children: React.ReactNode
  variant?: 'sale' | 'outOfStock' | 'lowStock' | 'default'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    sale: 'bg-red-100 text-red-700',
    outOfStock: 'bg-gray-100 text-gray-500',
    lowStock: 'bg-amber-100 text-amber-700',
    default: 'bg-gray-100 text-gray-700',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
