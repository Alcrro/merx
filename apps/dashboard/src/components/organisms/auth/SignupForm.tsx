import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../atoms/Input'
import { Button } from '../../atoms/Button'
import { useAuth } from '../../../hooks/useAuth'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  server?: string
}

function validate(name: string, email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!name.trim()) errors.name = 'Numele este obligatoriu'
  if (!email) errors.email = 'Email obligatoriu'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email invalid'
  if (!password) errors.password = 'Parola obligatorie'
  else if (password.length < 8) errors.password = 'Minim 8 caractere'
  return errors
}

export function SignupForm() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(name, email, password)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setIsLoading(true)
    setErrors({})
    try {
      await signup(email, password, name)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 409) {
        setErrors({ email: 'Există deja un cont cu acest email' })
      } else if (status === 400) {
        setErrors({ server: 'Date invalide. Verifică câmpurile.' })
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
        label="Nume"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        autoComplete="name"
        autoFocus
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        label="Parolă"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="new-password"
      />

      {errors.server && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.server}</p>
      )}

      <Button type="submit" isLoading={isLoading} fullWidth className="mt-2">
        Creează cont
      </Button>
    </form>
  )
}
