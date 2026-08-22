import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { IPasswordHasher } from '../ports/password-hasher.port'
import type { AuthUser, AuthStore, AuthTokens } from '../../domain/types'
import { AuthError } from '../../domain/errors'
import type { SessionService } from '../services/session.service'

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly storeRepo: IStoreRepository,
    private readonly hasher: IPasswordHasher,
    private readonly session: SessionService
  ) {}

  async execute(
    email: string,
    password: string
  ): Promise<{ tokens: AuthTokens; user: AuthUser; store: AuthStore | null }> {
    const user = await this.userRepo.findUserByEmail(email)
    const valid = user ? await this.hasher.compare(password, user.password) : false
    if (!user || !valid) throw AuthError.unauthorized()

    const store = await this.storeRepo.findStoreByOwnerId(user.id)

    const { password: _omit, ...safeUser } = user
    const tokens = await this.session.generate(safeUser.id, store?.id ?? '', safeUser.role)
    return { tokens, user: safeUser, store: store ?? null }
  }
}
