import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  variant?: 'features' | 'security'
}

const VARIANTS = {
  features: {
    tagline: "Tell us what you sell.\nWe'll run the store.",
    description: 'AI-native e-commerce — your store runs itself while you focus on what matters.',
    bullets: [
      'AI manages inventory, pricing and orders automatically',
      'Real-time analytics and actionable insights',
      'Storefront public cu domeniu custom',
    ],
  },
  security: {
    tagline: 'Your store, your data.\nNo surprises.',
    description: "We built Merx the way we'd want our own tools built — secure, transparent, and yours to own.",
    bullets: [
      'Payments via Stripe — we never store card numbers',
      'GDPR compliant — export or delete your data anytime',
      'Secure sessions — token rotation on every refresh, full logout on all devices',
    ],
  },
}

function AuthBranding({ variant = 'features' }: { variant?: 'features' | 'security' }) {
  const { tagline, description, bullets } = VARIANTS[variant]

  return (
    <div className="hidden lg:flex lg:flex-col lg:justify-between bg-gray-900 text-white p-12 lg:w-1/2">
      <div>
        <span className="text-xl font-bold tracking-tight">Merx</span>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold leading-tight whitespace-pre-line">{tagline}</h2>
          <p className="text-gray-400 text-base">{description}</p>
        </div>

        <ul className="space-y-4">
          {bullets.map((label) => (
            <li key={label} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm text-gray-300">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-gray-600">© {new Date().getFullYear()} Merx. All rights reserved.</p>
    </div>
  )
}

export function AuthLayout({ title, subtitle, children, footer, variant = 'features' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <AuthBranding variant={variant} />

      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Merx</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>

          <div>{children}</div>

          {footer && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">{footer}</p>
          )}
        </div>
      </div>
    </div>
  )
}
