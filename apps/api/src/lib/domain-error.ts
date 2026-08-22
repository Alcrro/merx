export class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = this.constructor.name
  }

  static notFound<T extends DomainError>(
    this: new (message: string, code: string) => T,
    message: string
  ): T {
    return new this(message, 'NOT_FOUND')
  }

  static conflict<T extends DomainError>(
    this: new (message: string, code: string) => T,
    message: string
  ): T {
    return new this(message, 'CONFLICT')
  }
}
