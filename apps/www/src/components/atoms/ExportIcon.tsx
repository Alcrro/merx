interface ExportIconProps {
  size?: number
  className?: string
}

export function ExportIcon({ size = 16, className }: ExportIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M8 2v8M5 5l3-3 3 3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 10v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
