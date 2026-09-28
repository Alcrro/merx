export interface UserDto {
  id: string
  email: string
  name: string | null
  platformRole: 'admin' | 'user'
  createdAt: Date
}

export interface StoreDto {
  id: string
  name: string
  slug: string
  currency: string
}

export interface LoginResponseDto {
  platformToken: string
  refreshToken: string
  user: UserDto
  stores: StoreDto[]
}

export interface GoogleSignInResponseDto extends LoginResponseDto {
  user: UserDto & { avatarUrl: string | null }
}

export interface SignupResponseDto {
  platformToken: string
  refreshToken: string
  user: UserDto
}

export interface RefreshResponseDto {
  accessToken: string
  refreshToken: string
}

export interface PlatformRefreshResponseDto {
  accessToken: string
}

export interface MeResponseDto {
  user: UserDto
  stores: StoreDto[]
}
