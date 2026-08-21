import { z } from 'zod'
import { OpenAIProvider } from '@merx/llm-provider'
import { prisma } from '../../../lib/prisma'

const llm = new OpenAIProvider()

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

async function fetchClassifierCriteria(): Promise<string[]> {
  const criteria = await prisma.aIToolCriteria.findMany({
    where: { toolName: 'variant-classify', deletedAt: null },
    select: { followUpText: true },
  })
  return criteria.map((c) => c.followUpText)
}

export async function classifyVariant(
  variantTitle: string,
  catalogProductTitle: string
): Promise<ClassificationResult> {
  const criteria = await fetchClassifierCriteria()
  const criteriaBlock = criteria.length
    ? `\nCriterii suplimentare de la admin:\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
    : ''

  const response = await llm.chat([
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
    // Fallback: treat as low confidence variant to avoid blocking owner
    return { type: 'variant', confidence: 'low', reason: 'AI response unparseable' }
  }

  try {
    return classificationSchema.parse(JSON.parse(jsonMatch[0]))
  } catch {
    return { type: 'variant', confidence: 'low', reason: 'AI response invalid' }
  }
}
