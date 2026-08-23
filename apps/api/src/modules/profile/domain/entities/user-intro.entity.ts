import { ProfileError } from '../errors'

export class UserIntro {
  private constructor(
    public readonly userId: string,
    private _completed: boolean,
    private _completedAt: Date | null,
  ) {}

  static create(userId: string): UserIntro {
    return new UserIntro(userId, false, null)
  }

  static reconstitute(userId: string, completed: boolean, completedAt: Date | null): UserIntro {
    return new UserIntro(userId, completed, completedAt)
  }

  get completed(): boolean { return this._completed }
  get completedAt(): Date | null { return this._completedAt }

  complete(): void {
    if (this._completed) throw ProfileError.alreadyCompleted()
    this._completed = true
    this._completedAt = new Date()
  }
}
