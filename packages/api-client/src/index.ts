import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token la fiecare request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('merx_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export * from './auth'
export * from './stores'
export * from './products'
export * from './orders'
export * from './inventory'
export * from './analytics'
export * from './ai'
