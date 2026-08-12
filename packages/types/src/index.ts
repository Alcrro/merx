// Auth
export interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
}

export interface Store {
  id: string
  ownerId: string
  name: string
  slug: string
  currency: string
  locale: string
  timezone: string
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Lighter shapes returned by auth endpoints (subset of User/Store)
export interface AuthUser {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export interface AuthStore {
  id: string
  name: string
  slug: string
  currency: string
}

// API responses
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
  store: AuthStore
}

// Products
export type ProductStatus = 'active' | 'draft' | 'archived'

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  title: string
  price: number
  compareAtPrice: number | null
  cost: number | null
  weight: number | null
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  storeId: string
  name: string
  slug: string
  createdAt: string
}

export interface Product {
  id: string
  storeId: string
  categoryId: string | null
  title: string
  description: string | null
  status: ProductStatus
  productType: string | null
  vendor: string | null
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
  category?: ProductCategory | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Orders
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded'
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled'

export interface OrderItem {
  id: string
  orderId: string
  variantId: string | null
  title: string
  sku: string | null
  quantity: number
  unitPrice: number
  total: number
}

export interface OrderCustomer {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

export interface Order {
  id: string
  storeId: string
  customerId: string | null
  orderNumber: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  currency: string
  subtotal: number
  discountTotal: number
  taxTotal: number
  shippingTotal: number
  total: number
  shippingAddress: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  customer: OrderCustomer | null
  items: OrderItem[]
}

// Inventory
export type MovementType = 'in' | 'out' | 'adjustment' | 'reserve' | 'release'

export interface InventoryVariantInfo {
  id: string
  sku: string
  title: string
  price: number
  productId: string
  productTitle: string
}

export interface InventoryItem {
  id: string
  variantId: string
  storeId: string
  quantity: number
  reservedQuantity: number
  reorderPoint: number
  availableQuantity: number
  updatedAt: string
  variant: InventoryVariantInfo
}

export interface InventoryMovement {
  id: string
  storeId: string
  variantId: string
  type: MovementType
  quantity: number
  note: string | null
  actorType: string
  createdAt: string
}

// Analytics
export interface AnalyticsOverview {
  revenue: number
  cost: number
  profit: number
  orders: number
  aov: number
  revenueChange: number
  ordersChange: number
  profitChange: number
  aovChange: number
}

export interface RevenueChartPoint {
  date: string
  revenue: number
}

export interface TopProduct {
  productId: string
  productTitle: string
  unitsSold: number
  revenue: number
  profit: number
  orders: number
}

// AI
export type AIRiskLevel = 'READ' | 'LOW' | 'MEDIUM' | 'HIGH'
export type AIActionStatus =
  | 'proposed'
  | 'approved'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'rolled_back'
export type AIMessageRole = 'user' | 'assistant' | 'tool' | 'system'
