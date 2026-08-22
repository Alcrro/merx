import bcrypt from 'bcryptjs'
import type { IPasswordHasher } from '../../application/ports/password-hasher.port'

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 12)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
