import { useState, useEffect, useRef } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer.current)
  }, [value, delay])

  return debounced
}
