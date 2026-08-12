import { useEffect, useState } from 'react'
import { Input } from '../atoms/Input'
import { Select } from '../atoms/Select'
import { Button } from '../atoms/Button'
import { useStore, useUpdateStore } from '../../hooks/useStore'

const CURRENCIES = [
  'EUR', 'USD', 'GBP', 'RON', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK',
  'HUF', 'BGN', 'CAD', 'AUD', 'NZD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN',
  'ZAR', 'SGD', 'HKD', 'AED', 'SAR', 'TRY', 'UAH',
].map((c) => ({ value: c, label: c }))

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'ro', label: 'Română' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'pl', label: 'Polski' },
  { value: 'hu', label: 'Magyar' },
]

const TIMEZONES = Intl.supportedValuesOf('timeZone').map((tz) => ({ value: tz, label: tz }))

type SaveStatus = 'idle' | 'success' | 'error'

export function StoreSettingsForm() {
  const { data: store, isLoading } = useStore()
  const { mutateAsync: updateStore, isPending } = useUpdateStore()

  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [locale, setLocale] = useState('en')
  const [timezone, setTimezone] = useState('Europe/Bucharest')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    if (store) {
      setName(store.name)
      setCurrency(store.currency)
      setLocale(store.locale)
      setTimezone(store.timezone)
    }
  }, [store])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('idle')
    try {
      await updateStore({ name, currency, locale, timezone })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    }
  }

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-sm text-gray-400">Se încarcă...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Numele magazinului"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select
          label="Monedă"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          options={CURRENCIES}
        />
        <Select
          label="Limbă"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          options={LOCALES}
        />
      </div>

      <Select
        label="Fus orar"
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
        options={TIMEZONES}
      />

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" isLoading={isPending}>
          Salvează
        </Button>
        {saveStatus === 'success' && (
          <span className="text-sm text-green-600">Salvat cu succes</span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-red-500">Eroare la salvare. Încearcă din nou.</span>
        )}
      </div>
    </form>
  )
}
