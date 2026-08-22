import type { AuthUser } from '../types'

export interface IUserRepository {
  findUserByEmail(email: string): Promise<(AuthUser & { password: string }) | null>
  findUserById(id: string): Promise<AuthUser | null>
  createUser(data: { email: string; password: string; name?: string }): Promise<AuthUser>
}
