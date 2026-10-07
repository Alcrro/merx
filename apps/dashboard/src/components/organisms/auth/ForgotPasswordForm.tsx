import { useState } from 'react'
import { Input } from '../../atoms/Input'
import { Button } from '../../atoms/Button'
import { authApi } from '@merx/api-client'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) { setError('Email obligatoriu'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email invalid'); return }

    setIsLoading(true)
    setError('')
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-700 dark:text-green-300">
        Dacă emailul există, vei primi un link de resetare în câteva minute. Verifică și folderul Spam.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError('') }}
        error={error}
        autoComplete="email"
        autoFocus
      />
      <Button type="submit" isLoading={isLoading} fullWidth>
        Trimite link de resetare
      </Button>
    </form>
  )
}
