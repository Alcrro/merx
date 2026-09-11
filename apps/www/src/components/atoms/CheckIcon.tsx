interface CheckIconProps {
  className?: string
  size?: number
}

export function CheckIcon({ className = 'text-indigo-500', size = 15 }: CheckIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 mt-0.5 ${className}`}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
