import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/templates/AuthLayout'
import { LoginForm } from '../../components/organisms/auth/LoginForm'

export function LoginPage() {
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
      <LoginForm />
    </AuthLayout>
  )
}
