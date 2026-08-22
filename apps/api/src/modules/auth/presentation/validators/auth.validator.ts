import { z } from 'zod'

export const authValidator = {
  signup: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8).max(72),
  }),

  login: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(1),
  }),

  refresh: z.object({
    refreshToken: z.string().min(1),
  }),

  logout: z.object({
    refreshToken: z.string().min(1),
  }),
}

export type SignupInput = z.infer<typeof authValidator.signup>
export type LoginInput = z.infer<typeof authValidator.login>
