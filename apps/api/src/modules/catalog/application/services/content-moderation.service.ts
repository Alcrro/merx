import type { LLMProvider } from '@merx/llm-provider'
import type { IAIToolCriteriaRepository, IModerationRepository } from '../../domain/ports'

interface ModerationResult {
  approved: boolean
  reason?: string
}

export class ContentModerationService {
  constructor(
    private readonly llm: LLMProvider,
    private readonly criteriaRepo: IAIToolCriteriaRepository,
    private readonly moderationRepo: IModerationRepository,
  ) {}

  async moderateProduct(catalogProductId: string): Promise<void> {
    const product = await this.moderationRepo.findProduct(catalogProductId)
    if (!product) {
      console.warn(`[moderation] product ${catalogProductId} not found`)
      return
    }

    let result: ModerationResult
    try {
      const criteria = await this.criteriaRepo.findTextByTool('moderation')
      result = await this.callModerationAI(product.title, product.description, criteria)
    } catch (err) {
      console.error(`[moderation] AI unavailable for product ${catalogProductId}:`, err)
      return
    }

    await this.moderationRepo.updateStatus(catalogProductId, result.approved ? 'active' : 'pending')

    if (!result.approved) {
      console.warn(`[moderation] product ${catalogProductId} rejected: ${result.reason}`)
    }
  }

  private async callModerationAI(title: string, description: string | null, criteria: string[]): Promise<ModerationResult> {
    const criteriaBlock = criteria.length
      ? `\nAdmin feedback pe decizii anterioare:\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
      : ''

    const response = await this.llm.chat([
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
}
