import type { AuthUser, AuthStore, AuthTokens } from '../../domain/types'
import type { UserDto, StoreDto, AuthResponseDto, TokensDto, MeResponseDto } from '../dto/auth.dto'

export const authMapper = {
  toUserDto(user: AuthUser): UserDto {
    return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }
  },

  toStoreDto(store: AuthStore): StoreDto {
    return { id: store.id, name: store.name, slug: store.slug, currency: store.currency }
  },

  toAuthResponse(tokens: AuthTokens, user: AuthUser, store: AuthStore | null): AuthResponseDto {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: authMapper.toUserDto(user),
      store: store ? authMapper.toStoreDto(store) : null,
    }
  },

  toTokensDto(tokens: AuthTokens): TokensDto {
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  },

  toMeResponse(user: AuthUser, store: AuthStore | null): MeResponseDto {
    return {
      user: authMapper.toUserDto(user),
      store: store ? authMapper.toStoreDto(store) : null,
    }
  },
}
