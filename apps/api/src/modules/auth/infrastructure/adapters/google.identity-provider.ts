import { OAuth2Client } from 'google-auth-library'
import type { GoogleIdentity, IGoogleIdentityProvider } from '../../application/ports/google-identity.port'
import { AuthError } from '../../domain/errors'
import { config } from '../../../../config'

export class GoogleIdentityProvider implements IGoogleIdentityProvider {
  private readonly client = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    `${config.server.wwwUrl}/api/auth/google/callback`
  )

  async exchangeCode(code: string): Promise<GoogleIdentity> {
    if (!config.google.clientId || !config.google.clientSecret) {
      throw new Error('Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)')
    }

    let payload
    try {
      const { tokens } = await this.client.getToken(code)
      if (!tokens.id_token) throw new Error('missing id_token')
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.google.clientId,
      })
      payload = ticket.getPayload()
    } catch {
      throw AuthError.unauthorized('Google authentication failed')
    }

    if (!payload?.sub || !payload.email) throw AuthError.unauthorized('Google authentication failed')

    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified === true,
      name: payload.name ?? null,
      avatarUrl: payload.picture ?? null,
    }
  }
}
