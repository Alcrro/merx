import { prisma } from '../../../../lib/prisma'
import type { IAIToolCriteriaRepository } from '../../domain/ports'

export class AIToolCriteriaRepository implements IAIToolCriteriaRepository {
  async findTextByTool(toolName: string): Promise<string[]> {
    const rows = await prisma.aIToolCriteria.findMany({
      where: { toolName, deletedAt: null },
      select: { followUpText: true },
    })
    return rows.map((r) => r.followUpText)
  }
}

export const aiToolCriteriaRepository = new AIToolCriteriaRepository()
