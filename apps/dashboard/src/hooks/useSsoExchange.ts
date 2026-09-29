import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@merx/api-client'
import { tokens } from '../lib/tokens'

export function useSsoExchange(code: string | null) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  // The SSO code is single-use; StrictMode's double effect run would burn it on the second call.
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (!code) {
      navigate('/login', { replace: true })
      return
    }

    authApi
      .ssoExchange({ code })
      .then(async (data) => {
        if (data.stores.length > 0) {
          const store = data.stores[0]
          const { accessToken, refreshToken } = await authApi.refresh({
            refreshToken: data.refreshToken,
            slug: store.slug,
          })
          tokens.set(accessToken, refreshToken, store.slug)
        } else {
          tokens.setRefresh(data.refreshToken)
        }
        window.location.replace('/')
      })
      .catch(() => setStatus('error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return status
}
