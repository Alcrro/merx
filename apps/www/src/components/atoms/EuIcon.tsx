interface EuIconProps {
  size?: number
  className?: string
}

export function EuIcon({ size = 16, className }: EuIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <circle cx="8" cy="8" r="5.5" stroke="white" strokeWidth="1.3" />
      <path d="M8 2.5c0 0-2 2-2 5.5s2 5.5 2 5.5M8 2.5c0 0 2 2 2 5.5S8 13.5 8 13.5M2.5 8h11" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
