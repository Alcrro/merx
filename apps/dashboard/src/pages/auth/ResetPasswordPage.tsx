import { AuthLayout } from '../../components/templates/AuthLayout'
import { ResetPasswordForm } from '../../components/organisms/auth/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Resetează parola"
      subtitle="Alege o parolă nouă pentru contul tău"
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
