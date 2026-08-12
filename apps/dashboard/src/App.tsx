import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/molecules/ProtectedRoute'
import { GuestRoute } from './components/molecules/GuestRoute'
import { DashboardLayout } from './components/templates/DashboardLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { StoreSettingsPage } from './pages/settings/StoreSettingsPage'
import { ProductsListPage } from './pages/products/ProductsListPage'
import { NewProductPage } from './pages/products/NewProductPage'
import { ProductDetailPage } from './pages/products/ProductDetailPage'
import { OrdersListPage } from './pages/orders/OrdersListPage'
import { OrderDetailPage } from './pages/orders/OrderDetailPage'
import { InventoryPage } from './pages/inventory/InventoryPage'
import { AnalyticsPage } from './pages/analytics/AnalyticsPage'
import { AIChatPage } from './pages/ai/AIChatPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsListPage />} />
            <Route path="/products/new" element={<NewProductPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/orders" element={<OrdersListPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ai" element={<AIChatPage />} />
            <Route path="/settings/store" element={<StoreSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
