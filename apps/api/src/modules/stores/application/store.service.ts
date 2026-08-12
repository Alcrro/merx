import type { IStoreRepository } from '../domain/ports'
import type { StoreEntity, UpdateStoreData } from '../domain/entities'

export class StoreError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'INVALID_CURRENCY' | 'INVALID_TIMEZONE'
  ) {
    super(message)
    this.name = 'StoreError'
  }
}

const SUPPORTED_CURRENCIES = new Set([
  'EUR', 'USD', 'GBP', 'RON', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK',
  'HUF', 'BGN', 'HRK', 'CAD', 'AUD', 'NZD', 'JPY', 'CNY', 'INR', 'BRL',
  'MXN', 'ZAR', 'SGD', 'HKD', 'AED', 'SAR', 'TRY', 'UAH',
])

const SUPPORTED_TIMEZONES = new Set(Intl.supportedValuesOf('timeZone'))

export class StoreService {
  constructor(private readonly repo: IStoreRepository) {}

  async getCurrent(storeId: string): Promise<StoreEntity> {
    const store = await this.repo.findById(storeId)
    if (!store) throw new StoreError('Store not found', 'NOT_FOUND')
    return store
  }

  async update(storeId: string, data: UpdateStoreData): Promise<StoreEntity> {
    const store = await this.repo.findById(storeId)
    if (!store) throw new StoreError('Store not found', 'NOT_FOUND')

    if (data.currency && !SUPPORTED_CURRENCIES.has(data.currency)) {
      throw new StoreError(
        `Invalid currency. Supported: ${[...SUPPORTED_CURRENCIES].join(', ')}`,
        'INVALID_CURRENCY'
      )
    }

    if (data.timezone && !SUPPORTED_TIMEZONES.has(data.timezone)) {
      throw new StoreError('Invalid IANA timezone', 'INVALID_TIMEZONE')
    }

    return this.repo.update(storeId, data)
  }
}
