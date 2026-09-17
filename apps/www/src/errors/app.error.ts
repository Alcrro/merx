import type { ErrorCode } from './codes'

export class AppError extends Error {
  constructor(
    message: string,
    public readonly userMessage: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
