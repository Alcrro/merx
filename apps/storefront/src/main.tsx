import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './contexts/CartContext'
import { StoreSlugProvider } from './contexts/StoreSlugContext'
import { resolveStoreSlug } from './lib/resolveSlug'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
})

const storeSlug = resolveStoreSlug() ?? ''

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoreSlugProvider slug={storeSlug}>
          <CartProvider>
            <App />
          </CartProvider>
        </StoreSlugProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
