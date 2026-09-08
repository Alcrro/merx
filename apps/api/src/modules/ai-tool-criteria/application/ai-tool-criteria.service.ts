import { prisma } from '../../../lib/prisma'
import type { AIToolCriteriaEntity } from '../domain/entities'

export class AIToolCriteriaError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND'
  ) {
    super(message)
    this.name = 'AIToolCriteriaError'
  }
}

export async function getActiveByTool(toolName: string): Promise<AIToolCriteriaEntity[]> {
  return prisma.aIToolCriteria.findMany({
    where: { toolName, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  })
}

export async function addFollowUp(
  toolName: string,
  followUpText: string,
  addedBy: string
): Promise<AIToolCriteriaEntity> {
  return prisma.aIToolCriteria.create({
    data: { toolName, followUpText, addedBy },
  })
}

export async function softDeleteFollowUp(id: string): Promise<void> {
  const existing = await prisma.aIToolCriteria.findUnique({ where: { id } })
  if (!existing) throw new AIToolCriteriaError('Criteria not found', 'NOT_FOUND')
  if (existing.deletedAt) return // already deleted

  await prisma.aIToolCriteria.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
