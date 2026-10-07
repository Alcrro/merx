import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '../../atoms/Input'
import { Button } from '../../atoms/Button'
import { authApi } from '@merx/api-client'

interface FormErrors {
  password?: string
  server?: string
}

function validate(password: string): FormErrors {
  const errors: FormErrors = {}
  if (!password) errors.password = 'Parola obligatorie'
  else if (password.length < 8) errors.password = 'Minim 8 caractere'
  else if (password.length > 64) errors.password = 'Maxim 64 caractere'
  return errors
}

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const token = searchParams.get('token') ?? ''

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate(password)
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (!token) {
      setErrors({ server: 'Link invalid sau expirat.' })
      return
    }

    setIsLoading(true)
    setErrors({})
    try {
      await authApi.resetPassword({ token, password })
      navigate('/login?reset=1', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 400) {
        setErrors({ server: 'Link-ul a expirat sau parola e invalidă. Încearcă din nou.' })
      } else {
        setErrors({ server: 'Ceva nu a mers. Încearcă din nou.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Parolă nouă"
        type="password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setErrors({}) }}
        error={errors.password}
        autoComplete="new-password"
        autoFocus
      />

      {errors.server && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.server}</p>
      )}

      <Button type="submit" isLoading={isLoading} fullWidth className="mt-2">
        Setează parola nouă
      </Button>
    </form>
  )
}
