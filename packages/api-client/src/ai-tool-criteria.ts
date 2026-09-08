import { apiClient } from './client'

export type AIToolName = 'catalog-generator' | 'moderation' | 'variant-classify' | 'archive'

export interface AIToolCriteria {
  id: string
  toolName: string
  followUpText: string
  addedBy: string
  createdAt: string
  deletedAt: string | null
}

export const aiToolCriteriaApi = {
  list: (toolName: AIToolName): Promise<AIToolCriteria[]> =>
    apiClient.get(`/admin/ai-tools/${toolName}/criteria`).then((r) => r.data),

  add: (toolName: AIToolName, followUpText: string): Promise<AIToolCriteria> =>
    apiClient.post(`/admin/ai-tools/${toolName}/criteria`, { followUpText }).then((r) => r.data),

  remove: (toolName: AIToolName, id: string): Promise<void> =>
    apiClient.delete(`/admin/ai-tools/${toolName}/criteria/${id}`).then(() => undefined),
}
