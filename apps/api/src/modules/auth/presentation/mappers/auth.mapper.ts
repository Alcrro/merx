import type { AuthUser, AuthStore, AuthTokens } from '../../domain/types'
import type { UserDto, StoreDto, LoginResponseDto, GoogleSignInResponseDto, SignupResponseDto, RefreshResponseDto, PlatformRefreshResponseDto, MeResponseDto } from '../dto/auth.dto'

export const authMapper = {
  toUserDto(user: AuthUser): UserDto {
    return { id: user.id, email: user.email, name: user.name, platformRole: user.platformRole, createdAt: user.createdAt }
  },

  toStoreDto(store: AuthStore): StoreDto {
    return { id: store.id, name: store.name, slug: store.slug, currency: store.currency }
  },

  toStoresDto(stores: AuthStore[]): StoreDto[] {
    return stores.map(authMapper.toStoreDto)
  },

  toLoginResponse(platformToken: string, refreshToken: string, user: AuthUser, stores: AuthStore[]): LoginResponseDto {
    return {
      platformToken,
      refreshToken,
      user: authMapper.toUserDto(user),
      stores: authMapper.toStoresDto(stores),
    }
  },

  toGoogleSignInResponse(
    platformToken: string,
    refreshToken: string,
    user: AuthUser,
    stores: AuthStore[],
    avatarUrl: string | null
  ): GoogleSignInResponseDto {
    const base = authMapper.toLoginResponse(platformToken, refreshToken, user, stores)
    return { ...base, user: { ...base.user, avatarUrl } }
  },

  toSignupResponse(platformToken: string, refreshToken: string, user: AuthUser): SignupResponseDto {
    return {
      platformToken,
      refreshToken,
      user: authMapper.toUserDto(user),
    }
  },

  toRefreshResponse(tokens: AuthTokens): RefreshResponseDto {
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  },

  toPlatformRefreshResponse(accessToken: string): PlatformRefreshResponseDto {
    return { accessToken }
  },

  toMeResponse(user: AuthUser, stores: AuthStore[]): MeResponseDto {
    return {
      user: authMapper.toUserDto(user),
      stores: authMapper.toStoresDto(stores),
    }
  },
}
