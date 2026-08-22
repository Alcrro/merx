import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IPasswordHasher } from '../ports/password-hasher.port'
import type { AuthUser, AuthTokens } from '../../domain/types'
import { AuthError } from '../../domain/errors'
import type { SessionService } from '../services/session.service'

export class SignupUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly session: SessionService
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{ tokens: AuthTokens; user: AuthUser; store: null }> {
    const existing = await this.userRepo.findUserByEmail(email)
    if (existing) throw AuthError.conflict('Email already registered')

    const passwordHash = await this.hasher.hash(password)
    const user = await this.userRepo.createUser({ email, password: passwordHash })

    const tokens = await this.session.generate(user.id, '', user.role)
    return { tokens, user, store: null }
  }
}
