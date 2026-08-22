import { OrderError } from '../errors'

export class Money {
  private constructor(readonly amount: number) {}

  static of(amount: number): Money {
    if (amount < 0) throw OrderError.invalid('Amount cannot be negative')
    return new Money(amount)
  }

  static validate(amount: number): void {
    if (amount < 0) throw OrderError.invalid('Amount cannot be negative')
  }
}
