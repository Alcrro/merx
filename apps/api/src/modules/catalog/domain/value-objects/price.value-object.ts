import { CatalogError } from '../errors'

export class Price {
  readonly value: number

  private constructor(amount: number) {
    this.value = amount
  }

  static of(amount: number): Price {
    if (amount < 0) throw new CatalogError('Price cannot be negative', 'INVALID')
    return new Price(amount)
  }

  static ofNullable(amount: number | null): Price | null {
    if (amount === null) return null
    return Price.of(amount)
  }
}
