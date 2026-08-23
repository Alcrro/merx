import type { ICustomerRepository } from '../domain/ports'
import type { CustomerWithStats, CustomerDetail, ListCustomersParams, PaginatedCustomers } from '../domain/entities'

export class CustomerError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND'
  ) {
    super(message)
    this.name = 'CustomerError'
  }
}

export class CustomerService {
  constructor(private readonly repo: ICustomerRepository) {}

  list(params: ListCustomersParams): Promise<PaginatedCustomers> {
    return this.repo.list(params)
  }

  async get(id: string, storeId: string): Promise<CustomerDetail> {
    const customer = await this.repo.findById(id, storeId)
    if (!customer) throw new CustomerError('Customer not found', 'NOT_FOUND')
    return customer
  }
}
