import { AuthRepository } from './infrastructure/db/repositories/auth.repository'
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt.password-hasher'
import { JwtTokenService } from './infrastructure/adapters/jwt.token-service'
import { AuthEmailService } from './infrastructure/adapters/auth.email-service'
import { ResendProvider } from '../email/infrastructure/resend.provider'
import { SessionService } from './application/services/session.service'
import { SignupUseCase } from './application/use-cases/signup.use-case'
import { LoginUseCase } from './application/use-cases/login.use-case'
import { RefreshUseCase } from './application/use-cases/refresh.use-case'
import { PlatformRefreshUseCase } from './application/use-cases/platform-refresh.use-case'
import { SsoExchangeUseCase } from './application/use-cases/sso-exchange.use-case'
import { CreateSsoCodeUseCase } from './application/use-cases/create-sso-code.use-case'
import { GoogleSignInUseCase } from './application/use-cases/google-sign-in.use-case'
import { GoogleIdentityProvider } from './infrastructure/adapters/google.identity-provider'
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case'
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case'
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case'
import { ResendVerificationUseCase } from './application/use-cases/resend-verification.use-case'
import { MeQuery } from './application/queries/me.query'
import { config } from '../../config'

const authRepository = new AuthRepository()
const passwordHasher = new BcryptPasswordHasher()
const tokenService = new JwtTokenService()
const googleIdentityProvider = new GoogleIdentityProvider()
const emailProvider = new ResendProvider(config.email.apiKey)
const authEmailService = new AuthEmailService(emailProvider)

export const sessionService = new SessionService(authRepository, tokenService)
export const signupUseCase = new SignupUseCase(authRepository, authRepository, passwordHasher, tokenService, authRepository, authEmailService)
export const loginUseCase = new LoginUseCase(authRepository, authRepository, authRepository, passwordHasher, tokenService)
export const refreshUseCase = new RefreshUseCase(authRepository, authRepository, authRepository, tokenService)
export const platformRefreshUseCase = new PlatformRefreshUseCase(authRepository, authRepository, tokenService)
export const ssoExchangeUseCase = new SsoExchangeUseCase(authRepository, authRepository, authRepository, tokenService)
export const createSsoCodeUseCase = new CreateSsoCodeUseCase(authRepository, tokenService)
export const googleSignInUseCase = new GoogleSignInUseCase(authRepository, authRepository, authRepository, googleIdentityProvider, tokenService)
export const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository, authRepository, tokenService, authEmailService)
export const resetPasswordUseCase = new ResetPasswordUseCase(authRepository, authRepository, authRepository, passwordHasher, tokenService)
export const verifyEmailUseCase = new VerifyEmailUseCase(authRepository, authRepository, tokenService)
export const resendVerificationUseCase = new ResendVerificationUseCase(authRepository, authRepository, tokenService, authEmailService)
export const meQuery = new MeQuery(authRepository, authRepository)
