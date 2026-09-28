import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetOrCreateCustomerUseCase } from '../../application/use-cases/get-or-create-customer.use-case'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { IBillingAccountRepository } from '../../domain/ports/billing-account.repository.port'
import { makeAccount, makeAccountRepo, makeGateway } from '../fixtures/billing.fixtures'

describe('GetOrCreateCustomerUseCase', () => {
  let gateway: IBillingGateway
  let accounts: IBillingAccountRepository
  let useCase: GetOrCreateCustomerUseCase

  beforeEach(() => {
    gateway = makeGateway()
    accounts = makeAccountRepo()
    useCase = new GetOrCreateCustomerUseCase(accounts, gateway)
  })

  it('returns the existing customer without calling Stripe', async () => {
    await expect(useCase.execute('u1')).resolves.toBe('cus_1')
    expect(gateway.createCustomer).not.toHaveBeenCalled()
  })

  it('creates and persists a customer when missing', async () => {
    vi.mocked(accounts.findById).mockResolvedValue(makeAccount({ stripeCustomerId: null, name: null }))
    await expect(useCase.execute('u1')).resolves.toBe('cus_new')
    expect(gateway.createCustomer).toHaveBeenCalledWith({ userId: 'u1', email: 'merchant@example.com', name: null })
    expect(accounts.setStripeCustomerId).toHaveBeenCalledWith('u1', 'cus_new')
  })

  it('throws NOT_FOUND when the account does not exist', async () => {
    vi.mocked(accounts.findById).mockResolvedValue(null)
    await expect(useCase.execute('u1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    expect(gateway.createCustomer).not.toHaveBeenCalled()
  })
})
