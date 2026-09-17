import { z } from 'zod'
import { TOPIC_KEYS } from '../config'
import { ValidationError } from '../errors'

const contactSchema = z.object({
  name: z.string().min(2, 'Numele trebuie să aibă cel puțin 2 caractere.'),
  email: z.string().email('Adresă de email invalidă.'),
  topic: z.enum(TOPIC_KEYS, { message: 'Subiect invalid.' }),
  body: z
    .string()
    .min(10, 'Mesajul trebuie să aibă cel puțin 10 caractere.')
    .max(2000, 'Mesajul nu poate depăși 2000 de caractere.'),
})

export type ContactInput = z.infer<typeof contactSchema>

export function parseContact(formData: FormData): ContactInput {
  const result = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    topic: formData.get('topic'),
    body: formData.get('body'),
  })
  if (!result.success) {
    throw new ValidationError(result.error.errors.map((e) => e.message).join(' · '))
  }
  return result.data
}
