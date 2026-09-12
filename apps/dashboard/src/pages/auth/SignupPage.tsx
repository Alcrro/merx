import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/templates/AuthLayout'
import { SignupForm } from '../../components/organisms/auth/SignupForm'

export function SignupPage() {
  return (
    <AuthLayout
      title="Creează un cont"
      subtitle="Lansează-ți magazinul în câteva minute"
      variant="security"
      footer={
        <>
          Ai deja cont?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Intră în cont
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  )
}
