import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../../components/templates/AuthLayout'
import { LoginForm } from '../../components/organisms/auth/LoginForm'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const passwordReset = searchParams.get('reset') === '1'

  return (
    <AuthLayout
      title="Bun venit înapoi"
      subtitle="Intră în contul tău Merx"
      footer={
        <>
          Nu ai cont?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
            Creează unul gratuit
          </Link>
        </>
      }
    >
      {passwordReset && (
        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-700 dark:text-green-300">
          Parola a fost resetată cu succes. Intră în cont cu noua parolă.
        </div>
      )}
      <LoginForm />
    </AuthLayout>
  )
}
