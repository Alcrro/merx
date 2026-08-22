export interface UserDto {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
}

export interface StoreDto {
  id: string
  name: string
  slug: string
  currency: string
}

export interface AuthResponseDto {
  accessToken: string
  refreshToken: string
  user: UserDto
  store: StoreDto | null
}

export interface TokensDto {
  accessToken: string
  refreshToken: string
}

export interface MeResponseDto {
  user: UserDto
  store: StoreDto | null
}
