import type {
  CustomerWithStats,
  CustomerDetail,
  ListCustomersParams,
  PaginatedCustomers,
} from './entities'

export interface ICustomerRepository {
  list(params: ListCustomersParams): Promise<PaginatedCustomers>
  findById(id: string, storeId: string): Promise<CustomerDetail | null>
}
