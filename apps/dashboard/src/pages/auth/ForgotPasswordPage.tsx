import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/templates/AuthLayout'
import { ForgotPasswordForm } from '../../components/organisms/auth/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Ai uitat parola?"
      subtitle="Introdu emailul și îți trimitem un link de resetare"
      footer={
        <>
          Îți amintești parola?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Intră în cont
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
