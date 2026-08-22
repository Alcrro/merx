export class RefreshToken {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly expiresAt: Date,
    readonly used: boolean
  ) {}

  isExpired(): boolean {
    return this.expiresAt < new Date()
  }

  isReused(): boolean {
    return this.used
  }
}
