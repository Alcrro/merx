// Auth
export interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
}

export interface StoreSettings {
  notificationEmail?: string
  business?: {
    companyName?: string
    vatNumber?: string
    contactEmail?: string
    phone?: string
    address?: string
    city?: string
    country?: string
  }
  notifications?: {
    orderCreated?: boolean
    lowStock?: boolean
    orderDelivered?: boolean
  }
  shipping?: {
    flatRate?: number
    freeShippingThreshold?: number | null
  }
  tax?: {
    rate?: number
    includedInPrice?: boolean
  }
}

export interface Store {
  id: string
  ownerId: string
  name: string
  slug: string
  currency: string
  locale: string
  timezone: string
  settings: StoreSettings
  createdAt: string
  updatedAt: string
}

// Lighter shapes returned by auth endpoints (subset of User/Store)
export interface AuthUser {
  id: string
  email: string
  name: string | null
  platformRole: 'admin' | 'user'
  createdAt: string
}

export interface AuthStore {
  id: string
  name: string
  slug: string
  currency: string
}

// API responses
export interface LoginResponse {
  platformToken: string
  refreshToken: string
  user: AuthUser
  stores: AuthStore[]
}

export interface SignupResponse {
  platformToken: string
  refreshToken: string
  user: AuthUser
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface MeResponse {
  user: AuthUser
  stores: AuthStore[]
}

// Pricing plans
export type { PlanId, AnalyticsLevel, SupportLevel, PlanLimits, PlanCapabilities, PlanConfig } from './plans'
export { PLAN_CONFIG, PLANS } from './plans'

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
  parentId: string | null
  createdAt: string
  children?: ProductCategory[]
}

export interface Brand {
  id: string
  storeId: string
  name: string
  slug: string
  logoUrl: string | null
}

export interface Tag {
  id: string
  storeId: string
  name: string
  slug: string
  type: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  altText: string | null
  position: number
  isPrimary: boolean
  createdAt: string
}

export interface Product {
  id: string
  storeId: string
  categoryId: string | null
  brandId: string | null
  title: string
  description: string | null
  status: ProductStatus
  productType: string | null
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
  images?: ProductImage[]
  category?: ProductCategory | null
  brand?: Brand | null
  tags?: Tag[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Orders
export type OrderStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus =
  | 'PENDING' | 'AUTHORIZED' | 'PAID' | 'PAYMENT_FAILED'
  | 'VOID' | 'REFUND_PENDING' | 'PARTIALLY_REFUNDED' | 'REFUNDED'
export type FulfillmentStatus =
  | 'UNFULFILLED' | 'PROCESSING' | 'SHIPPED' | 'LOST_IN_TRANSIT'
  | 'DELIVERED' | 'FULFILLED' | 'RETURN_IN_TRANSIT' | 'RETURNED'
export type DisplayStatus =
  | 'AWAITING_PAYMENT' | 'PAYMENT_AUTHORIZED' | 'PAYMENT_FAILED'
  | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'LOST_IN_TRANSIT'
  | 'DELIVERED' | 'CANCELLED' | 'COMPLETED'

export interface OrderItem {
  id: string
  orderId: string
  variantId: string | null
  title: string
  sku: string | null
  quantity: number
  unitPrice: number
  total: number
  productSnapshot: Record<string, unknown> | null
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
  displayStatus: DisplayStatus
  source: string
  currency: string
  subtotal: number
  discountTotal: number
  taxTotal: number
  shippingTotal: number
  total: number
  shippingAddress: Record<string, unknown> | null
  stripePaymentIntentId: string | null
  stripeSessionId: string | null
  paymentEventAt: string | null
  version: number
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

export interface StoreInventoryItem {
  storeProductVariantId: string
  productTitle: string
  variantTitle: string
  sku: string
  isActive: boolean
  quantity: number
  lastMovementType: 'in' | 'out' | 'adjustment' | null
}

export interface PaginatedStoreInventory {
  data: StoreInventoryItem[]
  total: number
  page: number
  limit: number
}


// Customers
export type CustomerSortBy = 'ltv' | 'orderCount' | 'createdAt' | 'lastOrderAt'

export type RFMSegment = 'champion' | 'loyal' | 'potential_loyalist' | 'at_risk' | 'lost' | 'new'

export interface RFMScore {
  r: number
  f: number
  m: number
  segment: RFMSegment
}

export interface CustomerOrderItem {
  id: string
  title: string
  quantity: number
  unitPrice: number
  total: number
}

export interface CustomerOrder {
  id: string
  orderNumber: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  currency: string
  total: number
  createdAt: string
  items: CustomerOrderItem[]
}

export interface CustomerWithStats {
  id: string
  storeId: string
  email: string
  firstName: string | null
  lastName: string | null
  createdAt: string
  updatedAt: string
  orderCount: number
  ltv: number
  lastOrderAt: string | null
  rfm: RFMScore
}

export interface CustomerDetail extends CustomerWithStats {
  orders: CustomerOrder[]
}

export interface CustomerAnalytics {
  monthlySpend: { month: string; total: number }[]
  aov: {
    customer: number
    store: number
    delta: number
  }
  cadence: {
    avgDaysBetweenOrders: number | null
    daysSinceLastOrder: number | null
    riskLevel: 'green' | 'yellow' | 'red' | null
  }
  topProducts: {
    productId: string
    title: string
    orderCount: number
    totalSpent: number
  }[]
}

// Product Analytics
export interface ProductAnalytics {
  totals: {
    revenue: number
    profit: number
    unitsSold: number
    orders: number
    margin: number
  }
  last30d: {
    revenue: number
    profit: number
    unitsSold: number
    orders: number
  }
  monthlySales: {
    month: string
    revenue: number
    unitsSold: number
  }[]
  variantStats: {
    variantId: string
    title: string
    sku: string
    price: number
    cost: number | null
    unitsSold: number
    revenue: number
    profit: number
    currentStock: number
    topCity: string | null
    topCityOrders: number
    topCountry: string | null
    topCountryOrders: number
  }[]
  geo: {
    cities: { name: string; orders: number }[]
    countries: { name: string; orders: number }[]
  }
  buyers: {
    total: number
    repeatBuyers: number
    repeatRate: number
    avgBuyerLtv: number
  }
  frequentlyBoughtWith: {
    productId: string
    title: string
    coOrders: number
  }[]
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

// Notifications
export type NotificationType =
  | 'ORDER_NEW'
  | 'ORDER_CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUND_PROCESSED'
  | 'STOCK_LOW'
  | 'STOCK_OUT'
  | 'STOCK_IN'
  | 'STOCK_REMOVAL'
  | 'STOCK_ADJUSTMENT'
  | 'PAYMENT_FAILED'
  | 'CHARGEBACK_OPENED'
  | 'AI_ACTION'
  | 'SYSTEM_WEBHOOK_FAILED'

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'

export interface Notification {
  id: string
  storeId: string
  type: NotificationType
  severity: NotificationSeverity
  title: string
  message: string
  metadata: Record<string, unknown> | null
  readAt: string | null
  createdAt: string
}

export interface NotificationFilters {
  limit?: number
  page?: number
  severity?: NotificationSeverity
  dateRange?: 'today' | '3d' | '7d' | '14d' | '30d'
  search?: string
  unreadOnly?: boolean
}

export interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
  total: number
}

// Intro
export interface IntroStateResponse {
  completed: boolean
}

export interface IntroCompleteResponse {
  completed: true
  userName: string
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
