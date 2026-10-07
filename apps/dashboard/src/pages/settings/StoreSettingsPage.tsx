import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { startStoreTour } from '../../hooks/useTour'
import { Input } from '../../components/atoms/Input'
import { Select } from '../../components/atoms/Select'
import { Button } from '../../components/atoms/Button'
import { CountrySelect } from '../../components/atoms/CountrySelect'
import { CitySelect } from '../../components/atoms/CitySelect'
import { useStore, useUpdateStore, useDeleteStore } from '../../hooks/useStore'
import { useAuth } from '../../contexts/AuthContext'
import {
  useShippingMethods,
  useCreateShippingMethod,
  useUpdateShippingMethod,
  useDeleteShippingMethod,
  useReorderShippingMethods,
} from '../../hooks/useShipping'
import type { ShippingMethod } from '@merx/api-client'

// ── Constants ─────────────────────────────────────────────────────────────────

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

type Section = 'general' | 'business' | 'shipping' | 'notifications' | 'danger'
type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

// ── Icons (inline SVG — no extra dependency) ──────────────────────────────────

function IconSettings() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconBuilding() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 22V12h6v10M3 9h18" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconStore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

const NAV: { id: Section; label: string; Icon: React.ComponentType }[] = [
  { id: 'general',       label: 'General',    Icon: IconSettings },
  { id: 'business',      label: 'Business',   Icon: IconBuilding },
  { id: 'shipping',      label: 'Livrare & TVA', Icon: IconTruck },
  { id: 'notifications', label: 'Notificări', Icon: IconBell     },
  { id: 'danger',        label: 'Pericol',    Icon: IconAlert    },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string | null | undefined, email: string): string {
  if (name?.trim()) {
    return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  }
  return email[0].toUpperCase()
}

function useSaveStatus(): [SaveStatus, (p: Promise<unknown>) => void] {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const run = (p: Promise<unknown>) => {
    setStatus('saving')
    p.then(() => {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    }).catch(() => setStatus('error'))
  }
  return [status, run]
}

function SaveFeedback({ status }: { status: SaveStatus }) {
  if (status === 'success')
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
        <IconCheck /> Salvat
      </span>
    )
  if (status === 'error')
    return <span className="text-sm text-red-500">Eroare. Încearcă din nou.</span>
  return null
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="pb-5 border-b border-gray-100 dark:border-gray-800">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  )
}

function SkeletonForm({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-5 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
      ))}
    </div>
  )
}

// ── Profile card ──────────────────────────────────────────────────────────────

function ProfileCard() {
  const { user, store } = useAuth()
  if (!user || !store) return null

  const initials = getInitials(user.name, user.email)

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-semibold select-none">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {user.name ?? user.email.split('@')[0]}
        </p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <IconStore />
          <span className="truncate">{store.name}</span>
        </div>
      </div>
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition duration-200 ease-in-out',
          checked ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

// ── Shipping form state ───────────────────────────────────────────────────────

type MethodForm = {
  name: string
  description: string
  price: string
  isFree: boolean
  minOrderForFree: string
  countries: string
  isActive: boolean
}

const emptyMethodForm: MethodForm = {
  name: '',
  description: '',
  price: '0',
  isFree: false,
  minOrderForFree: '',
  countries: '',
  isActive: true,
}

function methodToForm(m: ShippingMethod): MethodForm {
  return {
    name: m.name,
    description: m.description ?? '',
    price: String(m.price),
    isFree: m.isFree,
    minOrderForFree: m.minOrderForFree !== null ? String(m.minOrderForFree) : '',
    countries: m.countries.join(', '),
    isActive: m.isActive,
  }
}

function parseCountries(raw: string): string[] {
  return raw.split(',').map((s) => s.trim().toUpperCase()).filter((s) => s.length === 2)
}

// ── Sections ──────────────────────────────────────────────────────────────────

function GeneralSection() {
  const { data: store, isLoading } = useStore()
  const { mutateAsync: updateStore } = useUpdateStore()
  const [status, run] = useSaveStatus()

  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [locale, setLocale] = useState('en')
  const [timezone, setTimezone] = useState('Europe/Bucharest')

  useEffect(() => {
    if (store) {
      setName(store.name)
      setCurrency(store.currency)
      setLocale(store.locale)
      setTimezone(store.timezone)
    }
  }, [store])

  const isDirty =
    store != null && (
      name !== store.name ||
      currency !== store.currency ||
      locale !== store.locale ||
      timezone !== store.timezone
    )

  if (isLoading) return (
    <>
      <SectionHeader title="Informații generale" description="Numele, moneda și fusul orar afectează toate modulele platformei." />
      <div className="pt-6"><SkeletonForm rows={4} /></div>
    </>
  )

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    run(updateStore({ name, currency, locale, timezone }))
  }

  return (
    <>
      <div
        data-tour="general-header"
        data-tour-title="Informații generale"
        data-tour-description="Această secțiune controlează configurația de bază a magazinului: nume, adresă, monedă și fus orar."
        data-tour-side="bottom"
      >
        <SectionHeader title="Informații generale" description="Numele, moneda și fusul orar afectează toate modulele platformei." />
      </div>

      <form onSubmit={handleSubmit} className="pt-6 space-y-5">
        <div
          data-tour="store-name"
          data-tour-title="Numele magazinului"
          data-tour-description="Afișat pe storefront, pe facturi și în dashboard. Îl poți modifica oricând."
          data-tour-side="bottom"
        >
          <Input label="Numele magazinului" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div
          data-tour="storefront-address"
          data-tour-title="Adresa storefront"
          data-tour-description="URL-ul public al magazinului tău — slug.merx.com. Nu poate fi schimbat după creare."
          data-tour-side="bottom"
        >
          <FieldGroup label="Adresă storefront" hint="Slug-ul nu poate fi modificat după creare.">
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2 gap-0.5">
              <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{store?.slug}</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">.merx.com</span>
            </div>
          </FieldGroup>
        </div>

        <div
          data-tour="currency-locale"
          data-tour-title="Monedă & Limbă"
          data-tour-description="Moneda apare pe prețuri, facturi și checkout. Limba setează limba implicită a storefrontului."
          data-tour-side="bottom"
          className="grid grid-cols-2 gap-4"
        >
          <Select label="Monedă" value={currency} onChange={setCurrency} options={CURRENCIES} />
          <Select label="Limbă" value={locale} onChange={setLocale} options={LOCALES} />
        </div>

        <div
          data-tour="timezone"
          data-tour-title="Fus orar"
          data-tour-description="Afectează rapoartele de analytics și orele afișate pentru comenzile primite."
          data-tour-side="bottom"
        >
          <Select label="Fus orar" value={timezone} onChange={setTimezone} options={TIMEZONES} />
        </div>

        <div
          data-tour="save"
          data-tour-title="Salvează modificările"
          data-tour-description="Fiecare secțiune se salvează independent. Apasă după orice modificare."
          data-tour-side="top"
          className="pt-2 flex items-center gap-3"
        >
          <Button type="submit" disabled={!isDirty} isLoading={status === 'saving'}>Salvează modificările</Button>
          <SaveFeedback status={status} />
        </div>
      </form>
    </>
  )
}

function BusinessSection() {
  const { data: store, isLoading } = useStore()
  const { mutateAsync: updateStore } = useUpdateStore()
  const [status, run] = useSaveStatus()

  const [companyName, setCompanyName] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  useEffect(() => {
    const b = store?.settings.business
    if (b) {
      setCompanyName(b.companyName ?? '')
      setVatNumber(b.vatNumber ?? '')
      setContactEmail(b.contactEmail ?? '')
      setPhone(b.phone ?? '')
      setAddress(b.address ?? '')
      setCity(b.city ?? '')
      setCountry(b.country ?? '')
    }
  }, [store])

  const phoneError =
    phone && !/^\+[1-9]\d{6,14}$/.test(phone)
      ? 'Format invalid. Folosește prefixul internațional: +40700000000'
      : undefined

  const b = store?.settings.business
  const isDirty =
    store != null && (
      companyName !== (b?.companyName ?? '') ||
      vatNumber    !== (b?.vatNumber    ?? '') ||
      contactEmail !== (b?.contactEmail ?? '') ||
      phone        !== (b?.phone        ?? '') ||
      address      !== (b?.address      ?? '') ||
      city         !== (b?.city         ?? '') ||
      country      !== (b?.country      ?? '')
    )

  if (isLoading) return (
    <>
      <SectionHeader title="Informații business" description="Date de contact și identificare fiscală afișate pe documente și facturi." />
      <div className="pt-6"><SkeletonForm rows={5} /></div>
    </>
  )

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    run(updateStore({ settings: { business: { companyName, vatNumber, contactEmail, phone, address, city, country: country || undefined } } }))
  }

  return (
    <>
      <SectionHeader title="Informații business" description="Date de contact și identificare fiscală afișate pe documente și facturi." />

      <form onSubmit={handleSubmit} className="pt-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nume companie" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Merx SRL" />
          <Input label="CUI / VAT" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="RO12345678" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Email contact" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@companie.ro" />
          <Input label="Telefon" type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))} placeholder="+40700000000" error={phoneError} />
        </div>

        <FieldGroup label="Adresă">
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            placeholder="Str. Exemplu nr. 1"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
          />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Oraș">
            <CitySelect countryCode={country} value={city} onChange={setCity} />
          </FieldGroup>
          <FieldGroup label="Țară">
            <CountrySelect value={country} onChange={(code) => { setCountry(code); setCity('') }} placeholder="Selectează țara" />
          </FieldGroup>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button type="submit" disabled={!isDirty || !!phoneError} isLoading={status === 'saving'}>Salvează modificările</Button>
          <SaveFeedback status={status} />
        </div>
      </form>
    </>
  )
}

function ShippingSection() {
  const { data: methods = [], isLoading } = useShippingMethods()
  const { data: store } = useStore()
  const { mutateAsync: createMethod, isPending: isCreating } = useCreateShippingMethod()
  const { mutateAsync: updateMethod, mutate: toggleMethod, isPending: isUpdating } = useUpdateShippingMethod()
  const { mutateAsync: deleteMethod } = useDeleteShippingMethod()
  const { mutateAsync: reorderMethods } = useReorderShippingMethods()

  const currency = store?.currency ?? 'EUR'
  const [modal, setModal] = useState<'add' | ShippingMethod | null>(null)
  const [form, setForm] = useState<MethodForm>(emptyMethodForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!modal) return
    setFormError('')
    setForm(modal === 'add' ? emptyMethodForm : methodToForm(modal))
  }, [modal])

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim()) { setFormError('Numele este obligatoriu'); return }
    const price = form.isFree ? 0 : Number(form.price)
    if (isNaN(price) || price < 0) { setFormError('Prețul invalid'); return }
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      isFree: form.isFree,
      minOrderForFree: !form.isFree && form.minOrderForFree ? Number(form.minOrderForFree) : null,
      countries: parseCountries(form.countries),
      isActive: form.isActive,
    }
    try {
      if (modal === 'add') await createMethod(data)
      else if (modal) await updateMethod({ id: modal.id, data })
      setModal(null)
    } catch {
      setFormError('Eroare. Încearcă din nou.')
    }
  }

  const handleReorder = async (index: number, dir: -1 | 1) => {
    const next = [...methods]
    const swap = index + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    await reorderMethods(next.map((m) => m.id))
  }

  const formatPrice = (m: ShippingMethod) => {
    if (m.isFree) return 'Gratuit'
    if (m.minOrderForFree) return `${m.price} ${currency} · gratuit peste ${m.minOrderForFree} ${currency}`
    return `${m.price} ${currency}`
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'

  if (isLoading) return (
    <>
      <SectionHeader title="Metode de livrare" description="Configurează metodele disponibile la checkout." />
      <div className="pt-6"><SkeletonForm rows={3} /></div>
    </>
  )

  return (
    <>
      <SectionHeader title="Metode de livrare" description="Configurează metodele disponibile la checkout." />

      <div className="pt-6 space-y-4">
        {methods.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 py-10 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Nicio metodă de livrare adăugată.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {methods.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleReorder(i, -1)} disabled={i === 0} className="text-gray-300 dark:text-gray-700 hover:text-gray-500 disabled:opacity-30 transition text-xs leading-tight">▲</button>
                  <button onClick={() => handleReorder(i, 1)} disabled={i === methods.length - 1} className="text-gray-300 dark:text-gray-700 hover:text-gray-500 disabled:opacity-30 transition text-xs leading-tight">▼</button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{m.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatPrice(m)} · {m.countries.length === 0 ? 'Toate țările' : m.countries.join(', ')}
                  </p>
                </div>

                <Toggle
                  checked={m.isActive}
                  onChange={(v) => toggleMethod({ id: m.id, data: { isActive: v } })}
                />

                <button
                  onClick={() => setModal(m)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Editează
                </button>
                <button
                  onClick={() => setDeleteId(m.id)}
                  className="rounded-lg border border-red-100 dark:border-red-900/30 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                  Șterge
                </button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={() => setModal('add')}>Adaugă metodă</Button>
      </div>

      {/* Add / Edit modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">
              {modal === 'add' ? 'Adaugă metodă de livrare' : 'Editează metodă'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nume"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Fan Courier, DPD, Ridicare din magazin"
              />

              <FieldGroup label="Descriere (opțional)">
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Livrare în 24-48h"
                  className={inputCls}
                />
              </FieldGroup>

              <div className="flex items-center justify-between gap-6 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Livrare gratuită</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Prețul va fi 0 indiferent de comandă.</p>
                </div>
                <Toggle checked={form.isFree} onChange={(v) => setForm((f) => ({ ...f, isFree: v }))} />
              </div>

              {!form.isFree && (
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label={`Preț (${currency})`}>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className={inputCls}
                    />
                  </FieldGroup>
                  <FieldGroup label={`Gratuit peste (${currency})`} hint="Lasă gol dacă nu.">
                    <input
                      type="number" min="0" step="0.01"
                      value={form.minOrderForFree}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderForFree: e.target.value }))}
                      placeholder="ex: 200"
                      className={inputCls}
                    />
                  </FieldGroup>
                </div>
              )}

              <FieldGroup label="Țări (cod ISO, ex: RO, DE, FR)" hint="Lasă gol pentru toate țările.">
                <input
                  value={form.countries}
                  onChange={(e) => setForm((f) => ({ ...f, countries: e.target.value.toUpperCase() }))}
                  placeholder="RO, DE, FR"
                  className={`${inputCls} font-mono`}
                />
              </FieldGroup>

              <div className="flex items-center justify-between gap-6 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3.5">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Activă</p>
                <Toggle checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setModal(null)}>Anulează</Button>
                <Button type="submit" isLoading={isCreating || isUpdating}>
                  {modal === 'add' ? 'Adaugă' : 'Salvează'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Ștergi această metodă de livrare?</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Acțiunea nu poate fi anulată.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Anulează</Button>
              <button
                onClick={async () => { await deleteMethod(deleteId); setDeleteId(null) }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function NotificationsSection() {
  const { data: store, isLoading } = useStore()
  const { mutateAsync: updateStore } = useUpdateStore()
  const [status, run] = useSaveStatus()

  const [notificationEmail, setNotificationEmail] = useState('')
  const [orderCreated, setOrderCreated] = useState(true)
  const [lowStock, setLowStock] = useState(true)
  const [orderDelivered, setOrderDelivered] = useState(false)

  useEffect(() => {
    if (store) {
      setNotificationEmail(store.settings.notificationEmail ?? '')
      const n = store.settings.notifications
      if (n) {
        setOrderCreated(n.orderCreated ?? true)
        setLowStock(n.lowStock ?? true)
        setOrderDelivered(n.orderDelivered ?? false)
      }
    }
  }, [store])

  const emailError =
    notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)
      ? 'Format email invalid'
      : undefined

  if (isLoading) return (
    <>
      <SectionHeader title="Notificări email" description="Configurează adresa și evenimentele pentru care primești alerte automate." />
      <div className="pt-6"><SkeletonForm rows={4} /></div>
    </>
  )

  const handleSave = () => {
    run(updateStore({
      settings: {
        notificationEmail: notificationEmail.trim() || undefined,
        notifications: { orderCreated, lowStock, orderDelivered },
      },
    }))
  }

  const rows = [
    { label: 'Comandă nouă', desc: 'La fiecare comandă plasată și plătită.', value: orderCreated, set: setOrderCreated },
    { label: 'Stoc scăzut', desc: 'Când cantitatea scade sub pragul de reaprovizionare.', value: lowStock, set: setLowStock },
    { label: 'Comandă livrată', desc: 'Când o comandă ajunge la statusul livrat.', value: orderDelivered, set: setOrderDelivered },
  ]

  return (
    <>
      <SectionHeader title="Notificări email" description="Configurează adresa și evenimentele pentru care primești alerte automate." />

      <div className="pt-6 space-y-6">
        <div>
          <Input
            label="Email notificări comenzi"
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            placeholder="orders@magazinul-tau.ro"
            error={emailError}
          />
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            Alertele de comandă nouă ajung la această adresă. Dacă e gol, se folosește emailul contului tău.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Evenimente</p>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{r.desc}</p>
                </div>
                <Toggle checked={r.value} onChange={r.set} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center gap-3">
        <Button onClick={handleSave} disabled={!!emailError} isLoading={status === 'saving'}>Salvează modificările</Button>
        <SaveFeedback status={status} />
      </div>
    </>
  )
}

function DangerSection() {
  const { mutateAsync: deleteStore, isPending } = useDeleteStore()
  const { logout } = useAuth()
  const { data: store } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleDelete = async () => {
    try {
      await deleteStore()
      logout()
    } catch {
      setError('Eroare la ștergere. Încearcă din nou.')
    }
  }

  const close = () => { setShowModal(false); setConfirmText(''); setError('') }

  return (
    <>
      <SectionHeader title="Zona de pericol" description="Acțiuni ireversibile — procedează cu atenție maximă." />

      <div className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-6 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Șterge magazinul</p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Șterge permanent toate datele: produse, comenzi, clienți, inventar. Fără posibilitate de recuperare.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="shrink-0 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
          >
            Șterge
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
              <IconAlert />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Șterge magazinul definitiv?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Aceasta va șterge <strong className="text-gray-700 dark:text-gray-300">{store?.name}</strong> și toate datele asociate. Acțiunea nu poate fi anulată.
            </p>

            <div className="mt-5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Scrie <span className="font-mono text-gray-700 dark:text-gray-300 normal-case tracking-normal">{store?.name}</span> pentru a confirma
              </label>
              <input
                value={confirmText}
                onChange={(e) => { setConfirmText(e.target.value); setError('') }}
                placeholder={store?.name}
                className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
              {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>Anulează</Button>
              <button
                type="button"
                disabled={confirmText !== store?.name || isPending}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {isPending ? 'Se șterge…' : 'Șterge definitiv'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Tour starter ──────────────────────────────────────────────────────────────

function TourStarter({ onStarted }: { onStarted: () => void }) {
  const { data: store } = useStore()
  const started = useRef(false)

  useEffect(() => {
    if (!store || started.current) return
    started.current = true
    startStoreTour()
    onStarted()
  }, [store, onStarted])

  return null
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SECTIONS: Record<Section, React.ComponentType> = {
  general: GeneralSection,
  business: BusinessSection,
  shipping: ShippingSection,
  notifications: NotificationsSection,
  danger: DangerSection,
}

const VALID_SECTIONS = new Set<Section>(['general', 'business', 'shipping', 'notifications', 'danger'])

export function StoreSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('tab') as Section
  const active: Section = VALID_SECTIONS.has(raw) ? raw : 'general'
  const shouldTour = active === 'general' && searchParams.get('tour') === '1'

  function navigate(section: Section) {
    setSearchParams({ tab: section }, { replace: true })
  }

  const clearTourParam = useCallback(() => {
    setSearchParams((p) => { const n = new URLSearchParams(p); n.delete('tour'); return n }, { replace: true })
  }, [setSearchParams])

  const ActiveSection = SECTIONS[active]

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">

      {/* Sidebar */}
      <div className="w-full lg:w-56 shrink-0">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Profile */}
          <div className="p-4 pb-3">
            <ProfileCard />
          </div>

          <div className="mx-3 border-t border-gray-100 dark:border-gray-800" />

          {/* Nav — general, business, notifications */}
          <nav
            data-tour="settings-nav"
            data-tour-title="Navigare setări"
            data-tour-description="Navighează între secțiunile de configurare: General, Business, Livrare & TVA, Notificări."
            data-tour-side="right"
            className="p-2 space-y-0.5"
          >
            {NAV.filter((n) => n.id !== 'danger').map(({ id, label, Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(id)}
                  className={[
                    'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200',
                  ].join(' ')}
                >
                  <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                    <Icon />
                  </span>
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Divider + Danger */}
          <div className="mx-3 border-t border-gray-100 dark:border-gray-800" />
          <div className="p-2">
            <button
              type="button"
              onClick={() => navigate('danger')}
              className={[
                'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left',
                active === 'danger'
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                  : 'text-red-500 dark:text-red-400/70 hover:bg-red-50/60 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400',
              ].join(' ')}
            >
              <IconAlert />
              Pericol
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 lg:p-8">
        {shouldTour && <TourStarter onStarted={clearTourParam} />}
        <ActiveSection />
      </div>

    </div>
  )
}
