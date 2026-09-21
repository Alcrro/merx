import { AuthBrandPanel } from '@/features/auth/components/organisms/AuthBrandPanel'
import { AuthHeader } from '@/features/auth/components/molecules/AuthHeader'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-subtle lg:grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[5fr_4fr]">
      <AuthBrandPanel />

      <div className="flex flex-col min-h-screen lg:min-h-0">
        <AuthHeader />

        <main className="flex-1 flex items-center justify-center px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
