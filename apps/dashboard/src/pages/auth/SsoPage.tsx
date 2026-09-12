import { useSearchParams } from 'react-router-dom'
import { useSsoExchange } from '../../hooks/useSsoExchange'
import { SsoLoading } from './SsoLoading'
import { SsoError } from './SsoError'

export function SsoPage() {
  const [params] = useSearchParams()
  const status = useSsoExchange(params.get('code'))

  if (status === 'error') return <SsoError />
  return <SsoLoading />
}
