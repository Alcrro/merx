interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`sr-only focus:not-sr-only focus:fixed focus:top-3 focus:z-[200] focus:px-3 focus:py-1 focus:rounded-md focus:bg-indigo-600 focus:text-white focus:text-xs focus:font-medium focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-1 focus:ring-offset-indigo-600 ${className ?? 'focus:left-4'}`}
    >
      {children}
    </a>
  )
}
