import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { AuthUser, AuthStore } from '../../domain/types'
import { AuthError } from '../../domain/errors'

export class MeQuery {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly storeRepo: IStoreRepository
  ) {}

  async execute(userId: string): Promise<{ user: AuthUser; store: AuthStore | null }> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) throw AuthError.notFound('User not found')

    const store = await this.storeRepo.findStoreByOwnerId(userId)
    return { user, store: store ?? null }
  }
}
