interface ShieldIconProps {
  size?: number
  className?: string
}

export function ShieldIcon({ size = 16, className }: ShieldIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M8 2L3 4.5V8c0 3 2.5 5 5 5.5C11 13 13.5 11 13.5 8V4.5L8 2Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.5 8l1.5 1.5L10.5 6" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
