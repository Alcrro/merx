export class RefreshToken {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly expiresAt: Date,
    readonly used: boolean,
    readonly userAgent: string | null = null,
    readonly ip: string | null = null
  ) {}

  isExpired(): boolean {
    return this.expiresAt < new Date()
  }

  isReused(): boolean {
    return this.used
  }
}
