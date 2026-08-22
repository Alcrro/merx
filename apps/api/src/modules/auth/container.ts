import { AuthRepository } from './infrastructure/db/repositories/auth.repository'
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt.password-hasher'
import { JwtTokenService } from './infrastructure/adapters/jwt.token-service'
import { SessionService } from './application/services/session.service'
import { SignupUseCase } from './application/use-cases/signup.use-case'
import { LoginUseCase } from './application/use-cases/login.use-case'
import { RefreshUseCase } from './application/use-cases/refresh.use-case'
import { MeQuery } from './application/queries/me.query'
const authRepository = new AuthRepository()
const passwordHasher = new BcryptPasswordHasher()
const tokenService = new JwtTokenService()

export const sessionService = new SessionService(authRepository, tokenService)
export const signupUseCase = new SignupUseCase(authRepository, passwordHasher, sessionService)
export const loginUseCase = new LoginUseCase(authRepository, authRepository, passwordHasher, sessionService)
export const refreshUseCase = new RefreshUseCase(authRepository, authRepository, authRepository, tokenService)
export const meQuery = new MeQuery(authRepository, authRepository)
