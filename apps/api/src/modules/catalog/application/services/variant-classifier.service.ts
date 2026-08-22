import { z } from 'zod'
import type { LLMProvider } from '@merx/llm-provider'
import type { IAIToolCriteriaRepository } from '../../domain/ports'

export type VariantClassification = 'variant' | 'new_product'
export type ClassificationConfidence = 'high' | 'low'

export interface ClassificationResult {
  type: VariantClassification
  confidence: ClassificationConfidence
  reason?: string
}

const classificationSchema = z.object({
  type: z.enum(['variant', 'new_product']),
  confidence: z.enum(['high', 'low']),
  reason: z.string().optional(),
})

export class VariantClassifierService {
  constructor(
    private readonly llm: LLMProvider,
    private readonly criteriaRepo: IAIToolCriteriaRepository,
  ) {}

  async classify(
    variantTitle: string,
    catalogProductTitle: string
  ): Promise<ClassificationResult> {
    const criteria = await this.criteriaRepo.findTextByTool('variant-classify')
    const criteriaBlock = criteria.length
      ? `\nCriterii suplimentare de la admin:\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
      : ''

    const response = await this.llm.chat([
      {
        role: 'system',
        content: `Ești un clasificator de produse pentru o platformă de ecommerce. Determină dacă un titlu dat reprezintă o variantă a unui produs existent (ex: altă mărime, culoare, gramaj) sau un produs distinct nou.${criteriaBlock}

Răspunde EXCLUSIV cu JSON valid:
{
  "type": "variant" | "new_product",
  "confidence": "high" | "low",
  "reason": "explicație scurtă"
}

Reguli:
- "variant" dacă diferă doar prin atribut fizic (culoare, mărime, gramaj, material)
- "new_product" dacă are funcționalitate sau categorie diferită
- "low" confidence dacă există ambiguitate`,
      },
      {
        role: 'user',
        content: `Produs existent: "${catalogProductTitle}"\nTitlu nou propus: "${variantTitle}"`,
      },
    ])

    const content = response.content?.trim() ?? ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { type: 'variant', confidence: 'low', reason: 'AI response unparseable' }
    }

    try {
      return classificationSchema.parse(JSON.parse(jsonMatch[0]))
    } catch {
      return { type: 'variant', confidence: 'low', reason: 'AI response invalid' }
    }
  }
}
