import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { introApi } from '@merx/api-client'
import { Button } from '../../components/atoms/Button'
import { useAuth } from '../../contexts/AuthContext'

// ─── Typewriter ───────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 26) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setIsDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setIsDone(true)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return { displayed, isDone }
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay + 40)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      {children}
    </div>
  )
}

// ─── Left panel decorations ───────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'AI automat',
    desc: 'Comenzi, stoc, campanii — pilotate de AI',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    label: 'Analytics real-time',
    desc: 'Revenue, AOV, profit într-o privire',
  },
]

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
      style={{
        background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #4c1d95 65%, #2e1065 100%)',
      }}
    >
      {/* Grid mesh */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.08 }}
      >
        <defs>
          <pattern id="mesh" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh)" />
      </svg>

      {/* Glow orbs */}
      <div
        className="absolute rounded-full"
        style={{
          top: '15%',
          left: '10%',
          width: 320,
          height: 320,
          background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          bottom: '20%',
          right: '5%',
          width: 240,
          height: 240,
          background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <div className="relative z-10">
        <p className="text-white text-2xl font-bold tracking-tight">Merx</p>
        <p className="text-indigo-300/80 text-sm mt-1">AI e-commerce operator</p>
      </div>

      {/* Features */}
      <div className="relative z-10 space-y-6">
        {FEATURES.map((f) => (
          <div key={f.label} className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {f.icon}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{f.label}</p>
              <p className="text-indigo-200/60 text-sm mt-0.5 leading-snug">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative metric cards */}
      <div className="relative z-10 flex gap-3">
        {[
          { label: 'Revenue lunar', value: '€24,830', delta: '↑ 12.4%' },
          { label: 'Comenzi azi', value: '148', delta: '↑ 8.1%' },
        ].map((card) => (
          <div
            key={card.label}
            className="flex-1 rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p className="text-indigo-200/50 text-xs">{card.label}</p>
            <p className="text-white font-bold text-xl mt-1">{card.value}</p>
            <p className="text-emerald-400 text-xs mt-1 font-medium">{card.delta}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step = 'greeting' | 'name' | 'done'

const GREETING = 'Salut! Sunt Merx — operatorul tău AI de e-commerce.\n\nHai să te cunoaștem mai bine.'

// ─── Page ─────────────────────────────────────────────────────────────────────

export function IntroPage() {
  const [step, setStep] = useState<Step>('greeting')
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedName, setConfirmedName] = useState('')
  const navigate = useNavigate()
  const { markIntroCompleted } = useAuth()

  const { displayed, isDone } = useTypewriter(GREETING)

  // Auto-advance from greeting to name
  useEffect(() => {
    if (!isDone) return
    const t = setTimeout(() => setStep('name'), 700)
    return () => clearTimeout(t)
  }, [isDone])

  // Auto-redirect after done
  useEffect(() => {
    if (step !== 'done') return
    const t = setTimeout(() => {
      markIntroCompleted()
      void navigate('/dashboard', { replace: true })
    }, 2600)
    return () => clearTimeout(t)
  }, [step, navigate, markIntroCompleted])

  const handleComplete = useCallback(async () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setNameError('Cel puțin 2 caractere.')
      return
    }
    if (trimmed.length > 50) {
      setNameError('Prea lung — maxim 50 caractere.')
      return
    }
    setNameError(undefined)
    setIsSubmitting(true)
    try {
      await introApi.complete(trimmed)
      setConfirmedName(trimmed)
      setStep('done')
    } catch {
      setNameError('Ceva n-a mers. Încearcă din nou.')
    } finally {
      setIsSubmitting(false)
    }
  }, [name])

  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-sm">

          {/* ── Greeting ── */}
          {step === 'greeting' && (
            <div>
              <div className="mb-8 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-gray-900 dark:text-gray-100 text-xl font-medium leading-relaxed whitespace-pre-line min-h-[96px]">
                {displayed}
                {!isDone && (
                  <span
                    className="inline-block w-0.5 h-5 bg-indigo-600 ml-0.5 align-middle"
                    style={{ animation: 'blink 1s step-end infinite' }}
                  />
                )}
              </p>
              <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
            </div>
          )}

          {/* ── Name ── */}
          {step === 'name' && (
            <FadeIn>
              <div className="mb-8 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Cum te cheamă?
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
                Voi folosi numele ăsta în conversațiile noastre.
              </p>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Prenumele tău"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void handleComplete() }}
                    className={[
                      'w-full rounded-xl border px-4 py-3 text-base outline-none transition',
                      'text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600',
                      'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                      nameError
                        ? 'border-red-400 bg-red-50 dark:bg-red-950/30 dark:border-red-700'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
                    ].join(' ')}
                  />
                  {nameError && (
                    <p className="text-xs text-red-500 dark:text-red-400">{nameError}</p>
                  )}
                </div>

                <Button fullWidth isLoading={isSubmitting} onClick={() => void handleComplete()}>
                  Continuă
                </Button>
              </div>
            </FadeIn>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <FadeIn>
              <div className="text-center">
                <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center ring-4 ring-emerald-100 dark:ring-emerald-900/30">
                  <svg
                    className="w-8 h-8 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Salut, {confirmedName}!
                </h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
                  Totul e pregătit. Te duc în dashboard...
                </p>
                <div className="flex justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                </div>
              </div>
            </FadeIn>
          )}

        </div>
      </div>
    </div>
  )
}
