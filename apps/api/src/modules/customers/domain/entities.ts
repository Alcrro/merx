export type RFMSegment = 'champion' | 'loyal' | 'potential_loyalist' | 'at_risk' | 'lost' | 'new'

export interface RFMScore {
  r: number
  f: number
  m: number
  segment: RFMSegment
}

export interface CustomerEntity {
  id: string
  storeId: string
  email: string
  firstName: string | null
  lastName: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CustomerWithStats extends CustomerEntity {
  orderCount: number
  ltv: number
  lastOrderAt: Date | null
  rfm: RFMScore
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
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  currency: string
  total: number
  createdAt: Date
  items: CustomerOrderItem[]
}

export interface CustomerDetail extends CustomerWithStats {
  orders: CustomerOrder[]
}

export type CustomerSortBy = 'ltv' | 'orderCount' | 'createdAt' | 'lastOrderAt'

export interface ListCustomersParams {
  storeId: string
  search?: string
  sortBy?: CustomerSortBy
  page: number
  limit: number
}

export interface PaginatedCustomers {
  data: CustomerWithStats[]
  total: number
  page: number
  limit: number
}
