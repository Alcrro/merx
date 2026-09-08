import { z } from 'zod'
import { OpenAIProvider } from '@merx/llm-provider'
import { prisma } from '../../../lib/prisma'

const llm = new OpenAIProvider()

const generatedProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string(),
  productType: z.string().optional(),
  variants: z.array(z.object({
    title: z.string(),
    sku: z.string(),
    suggestedPrice: z.number().nonnegative(),
  })).min(1),
})

export type GeneratedProduct = z.infer<typeof generatedProductSchema>

async function fetchGeneratorCriteria(): Promise<string[]> {
  const criteria = await prisma.aIToolCriteria.findMany({
    where: { toolName: 'catalog-generator', deletedAt: null },
    select: { followUpText: true },
  })
  return criteria.map((c) => c.followUpText)
}

export async function generateCatalogProduct(
  requestedTitle: string,
  category: string | null,
  description: string | null
): Promise<GeneratedProduct> {
  const criteria = await fetchGeneratorCriteria()
  const criteriaBlock = criteria.length
    ? `\nCriterii suplimentare de la admin:\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
    : ''

  const response = await llm.chat([
    {
      role: 'system',
      content: `Ești un asistent specializat în generarea de fișe de produse pentru o platformă de ecommerce. Generează un produs complet pe baza titlului și categoriei primite.${criteriaBlock}

Răspunde EXCLUSIV cu JSON valid, fără markdown, fără explicații. Schema exactă:
{
  "title": "titlu clar și comercial",
  "description": "descriere de 2-3 propoziții, orientată spre beneficii",
  "productType": "tip produs (ex: physical, digital, service)",
  "variants": [
    { "title": "denumire variantă (ex: Roșu / M)", "sku": "SKU-UNIC-001", "suggestedPrice": 99.99 }
  ]
}`,
    },
    {
      role: 'user',
      content: [
        `Titlu cerut: ${requestedTitle}`,
        category ? `Categorie: ${category}` : null,
        description ? `Descriere suplimentară de la owner: ${description}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    },
  ])

  const content = response.content?.trim() ?? ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI returned no valid JSON')
  }

  const parsed = JSON.parse(jsonMatch[0]) as unknown
  return generatedProductSchema.parse(parsed)
}
