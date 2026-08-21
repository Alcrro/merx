import { OpenAIProvider } from '@merx/llm-provider'
import { prisma } from '../../../lib/prisma'

const llm = new OpenAIProvider()

interface ModerationResult {
  approved: boolean
  reason?: string
}

async function fetchModerationCriteria(): Promise<string[]> {
  const criteria = await prisma.aIToolCriteria.findMany({
    where: { toolName: 'moderation', deletedAt: null },
    select: { followUpText: true },
  })
  return criteria.map((c) => c.followUpText)
}

async function callModerationAI(title: string, description: string | null, criteria: string[]): Promise<ModerationResult> {
  const criteriaBlock = criteria.length
    ? `\nAdmin feedback pe decizii anterioare:\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
    : ''

  const response = await llm.chat([
    {
      role: 'system',
      content: `Ești un moderator de conținut pentru o platformă de comerț electronic. Verifică dacă titlul și descrierea produsului sunt potrivite pentru publicare: fără conținut ofensator, înșelător sau ilegal.${criteriaBlock}\n\nRăspunde DOAR cu JSON: {"approved": true/false, "reason": "motivul dacă respins"}`,
    },
    {
      role: 'user',
      content: `Titlu: ${title}\nDescriere: ${description ?? '(fără descriere)'}`,
    },
  ])

  const content = response.content?.trim() ?? ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { approved: true }

  try {
    return JSON.parse(jsonMatch[0]) as ModerationResult
  } catch {
    return { approved: true }
  }
}

export async function moderateCatalogProduct(catalogProductId: string): Promise<void> {
  const product = await prisma.catalogProduct.findUnique({
    where: { id: catalogProductId },
  })

  if (!product) {
    console.warn(`[moderation] product ${catalogProductId} not found`)
    return
  }

  let result: ModerationResult
  try {
    const criteria = await fetchModerationCriteria()
    result = await callModerationAI(product.title, product.description, criteria)
  } catch (err) {
    // AI unavailable — leave in pending, escalation job will handle it
    console.error(`[moderation] AI unavailable for product ${catalogProductId}:`, err)
    return
  }

  await prisma.catalogProduct.update({
    where: { id: catalogProductId },
    data: { status: result.approved ? 'active' : 'pending' },
  })

  if (!result.approved) {
    console.warn(`[moderation] product ${catalogProductId} rejected: ${result.reason}`)
  }
}
