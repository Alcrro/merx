import { z } from 'zod'
import type { LLMProvider } from '@merx/llm-provider'

const suggestedVariantsSchema = z.object({
  variants: z.array(z.object({
    title: z.string().min(1),
    sku: z.string().min(1),
    suggestedPrice: z.number().nonnegative(),
  })).min(1),
})

export interface SuggestedVariant {
  title: string
  sku: string
  suggestedPrice: number
}

export class GenerateVariantsService {
  constructor(private readonly llm: LLMProvider) {}

  async generate(
    productTitle: string,
    existingVariants: { title: string; sku: string; suggestedPrice: number }[],
    hint: string
  ): Promise<SuggestedVariant[]> {
    const existingBlock = existingVariants.length
      ? existingVariants.map((v) => `- "${v.title}" | SKU: ${v.sku} | Preț: ${v.suggestedPrice}`).join('\n')
      : 'Nicio variantă existentă.'

    const response = await this.llm.chat([
      {
        role: 'system',
        content: `Ești un asistent de catalog produse. Primești un produs cu variantele sale existente și un hint pentru o nouă variantă (ex: o culoare, un storage, un material).

Generezi TOATE variantele logice pentru hint-ul primit, urmând exact același pattern de denumire, SKU și prețuri ca variantele existente.

Dacă există Black/128GB și Black/256GB și White/128GB și White/256GB, iar hint-ul e "Bronze", generezi Bronze/128GB și Bronze/256GB cu prețuri similare.

Răspunde EXCLUSIV cu JSON valid, fără markdown:
{
  "variants": [
    { "title": "denumire variantă", "sku": "SKU-UNIC", "suggestedPrice": 99.99 }
  ]
}

Reguli SKU: urmează același format ca SKU-urile existente, înlocuind partea relevantă (culoare/storage etc.). Dacă nu există pattern clar, generează un SKU logic unic.`,
      },
      {
        role: 'user',
        content: `Produs: "${productTitle}"

Variante existente:
${existingBlock}

Hint variantă nouă: "${hint}"

Generează toate variantele logice pentru "${hint}".`,
      },
    ])

    const content = response.content?.trim() ?? ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI returned no valid JSON')

    const parsed = suggestedVariantsSchema.parse(JSON.parse(jsonMatch[0]))
    return parsed.variants
  }
}
