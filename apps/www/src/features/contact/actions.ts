'use server'

import { AppError } from '@/errors/app.error'
import { TOPIC_EMAIL_MAP, EMAIL_TO_CHANNEL_KEY } from './config'
import { parseContact } from './validators/contact.validator'
import { checkRateLimit, markRateLimited } from './services/rate-limiter'
import { sendEmail } from './services/mailer'
import type { ContactFormState } from './types'

export type { ContactFormState }

export async function sendContactEmail(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const trap = formData.get('_trap')
  if (trap !== null && trap !== '') return { status: 'success' }

  try {
    await checkRateLimit()

    const { name, email, topic, body } = parseContact(formData)

    const toEmail = TOPIC_EMAIL_MAP[topic] ?? ''
    const responseTimeKey = EMAIL_TO_CHANNEL_KEY[toEmail]

    await sendEmail({ name, email, topic, body, toEmail })
    await markRateLimited()

    return { status: 'success', responseTimeKey }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', code: err.code, message: err.userMessage }
    throw err
  }
}
