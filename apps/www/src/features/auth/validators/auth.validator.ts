import { z } from 'zod'
import { AuthValidationError } from '../errors'

export const loginSchema = z.object({
  email: z.string().email('emailInvalid'),
  password: z.string().min(1, 'passwordRequired'),
})

export const signupSchema = z.object({
  name: z.string().min(1, 'nameRequired'),
  email: z.string().email('emailInvalid'),
  password: z.string().min(8, 'passwordTooShort'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>

export function parseLogin(formData: FormData): LoginInput {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!result.success) throw new AuthValidationError(result.error.errors[0].message)
  return result.data
}

export function parseSignup(formData: FormData): SignupInput {
  const result = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!result.success) throw new AuthValidationError(result.error.errors[0].message)
  return result.data
}

export const forgotPasswordSchema = z.object({
  email: z.string().email('emailInvalid'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'tokenRequired'),
  password: z.string().min(8, 'passwordTooShort').max(64, 'passwordTooLong'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export function parseForgotPassword(formData: FormData): ForgotPasswordInput {
  const result = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!result.success) throw new AuthValidationError(result.error.errors[0].message)
  return result.data
}

export function parseResetPassword(formData: FormData): ResetPasswordInput {
  const result = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  })
  if (!result.success) throw new AuthValidationError(result.error.errors[0].message)
  return result.data
}
