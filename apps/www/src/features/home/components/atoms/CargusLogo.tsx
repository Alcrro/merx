export function CargusLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 48"
      aria-label="Cargus"
      className={className}
      fill="none"
    >
      {/* C shield mark */}
      <path
        d="M8 6h18c2.2 0 4 1.8 4 4v8c0 8-4.5 16-13 20C8.5 34 4 26 4 18v-8c0-2.2 1.8-4 4-4z"
        fill="#E8640C"
      />
      <path
        d="M22 15a7 7 0 1 0 0 10"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* CARGUS text — currentColor adapts to dark/light */}
      <text
        x="42"
        y="33"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="22"
        letterSpacing="1"
        fill="currentColor"
      >
        CARGUS
      </text>
    </svg>
  )
}
