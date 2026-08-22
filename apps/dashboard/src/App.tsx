import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/molecules/auth/ProtectedRoute'
import { GuestRoute } from './components/molecules/auth/GuestRoute'
import { IntroRoute } from './components/molecules/auth/IntroRoute'
import { DashboardLayout } from './components/templates/DashboardLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { StoreSettingsPage } from './pages/settings/StoreSettingsPage'
import { ProductsListPage } from './pages/products/ProductsListPage'
import { ProductDetailPage } from './pages/products/ProductDetailPage'
import { CatalogPage } from './pages/products/CatalogPage'
import { ProductRequestsPage } from './pages/products/ProductRequestsPage'
import { StoreProductDetailPage } from './pages/products/StoreProductDetailPage'
import { StoreProductVariantDetailPage } from './pages/products/StoreProductVariantDetailPage'
import { OrdersListPage } from './pages/orders/OrdersListPage'
import { OrderDetailPage } from './pages/orders/OrderDetailPage'
import { InventoryPage } from './pages/inventory/InventoryPage'
import { AnalyticsPage } from './pages/analytics/AnalyticsPage'
import { AIChatPage } from './pages/ai/AIChatPage'
import { CustomersListPage } from './pages/customers/CustomersListPage'
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage'
import { MarketplaceFeedPage } from './pages/marketplace/MarketplaceFeedPage'
import { CreateListingPage } from './pages/marketplace/listings/CreateListingPage'
import { MyListingsPage } from './pages/marketplace/listings/MyListingsPage'
import { ListingDetailPage } from './pages/marketplace/listings/ListingDetailPage'
import { ConnectOnboardPage } from './pages/marketplace/connect/ConnectOnboardPage'
import { ConnectReturnPage } from './pages/marketplace/connect/ConnectReturnPage'
import { ConnectRefreshPage } from './pages/marketplace/connect/ConnectRefreshPage'
import { DiscountsPage } from './pages/discounts/DiscountsPage'
import { AdminCatalogPage } from './pages/admin/AdminCatalogPage'
import { AdminProductRequestsPage } from './pages/admin/AdminProductRequestsPage'
import { AdminArchiveCriteriaPage } from './pages/admin/AdminArchiveCriteriaPage'
import { AdminAIToolCriteriaPage } from './pages/admin/AdminAIToolCriteriaPage'
import { ThemeBuilderPage } from './pages/theme/ThemeBuilderPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { SubscribePage } from './pages/subscribe/SubscribePage'
import { IntroPage } from './pages/intro/IntroPage'

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
            path="/intro"
            element={
              <IntroRoute>
                <IntroPage />
              </IntroRoute>
            }
          />

          {/* Public routes — no auth required */}
          <Route element={<DashboardLayout />}>
            <Route path="/marketplace" element={<MarketplaceFeedPage />} />
            <Route path="/marketplace/listings/:id" element={<ListingDetailPage />} />
            <Route path="/subscribe" element={<SubscribePage />} />
          </Route>

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsListPage />} />
            <Route path="/products/catalog" element={<CatalogPage />} />
            <Route path="/products/requests" element={<ProductRequestsPage />} />
            <Route path="/products/store/:storeProductId" element={<StoreProductDetailPage />} />
            <Route path="/products/store/:storeProductId/variants/:catalogVariantId" element={<StoreProductVariantDetailPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/orders" element={<OrdersListPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ai" element={<AIChatPage />} />
            <Route path="/customers" element={<CustomersListPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/settings/store" element={<StoreSettingsPage />} />
            <Route path="/marketplace/listings/new" element={<CreateListingPage />} />
            <Route path="/marketplace/listings/mine" element={<MyListingsPage />} />
            <Route path="/marketplace/connect/onboard" element={<ConnectOnboardPage />} />
            <Route path="/marketplace/connect/return" element={<ConnectReturnPage />} />
            <Route path="/marketplace/connect/refresh" element={<ConnectRefreshPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            <Route path="/admin/product-requests" element={<AdminProductRequestsPage />} />
            <Route path="/admin/archive-criteria" element={<AdminArchiveCriteriaPage />} />
            <Route path="/admin/ai-criteria" element={<AdminAIToolCriteriaPage />} />
            <Route path="/theme" element={<ThemeBuilderPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
