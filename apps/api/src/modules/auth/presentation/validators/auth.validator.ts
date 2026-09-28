import { z } from 'zod'

export const authValidator = {
  signup: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8).max(64),
  }),

  login: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(1),
  }),

  refresh: z.object({
    refreshToken: z.string().min(1),
    slug: z.string().min(1),
  }),

  logout: z.object({
    refreshToken: z.string().min(1),
  }),

  platformRefresh: z.object({
    refreshToken: z.string().min(1),
  }),

  googleSignIn: z.object({
    code: z.string().min(1).max(2048),
  }),

  ssoExchange: z.object({
    code: z.string().min(1),
  }),

  forgotPassword: z.object({
    email: z.string().email().trim().toLowerCase(),
  }),

  resetPassword: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(64),
  }),

  verifyEmail: z.object({
    token: z.string().min(1),
  }),
}

export type SignupInput = z.infer<typeof authValidator.signup>
export type LoginInput = z.infer<typeof authValidator.login>
export type RefreshInput = z.infer<typeof authValidator.refresh>
