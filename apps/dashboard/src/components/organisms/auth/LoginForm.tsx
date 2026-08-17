import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../atoms/Input'
import { Button } from '../../atoms/Button'
import { useAuth } from '../../../hooks/useAuth'

interface FormErrors {
  email?: string
  password?: string
  server?: string
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!email) errors.email = 'Email obligatoriu'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email invalid'
  if (!password) errors.password = 'Parola obligatorie'
  return errors
}

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(email, password)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setIsLoading(true)
    setErrors({})
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 401) {
        setErrors({ server: 'Email sau parolă incorectă' })
      } else if (status === 429) {
        setErrors({ server: 'Prea multe încercări. Încearcă din nou în 1 minut.' })
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
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        autoFocus
      />
      <Input
        label="Parolă"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      {errors.server && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.server}</p>
      )}

      <Button type="submit" isLoading={isLoading} fullWidth className="mt-2">
        Intră în cont
      </Button>
    </form>
  )
}
