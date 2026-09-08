export interface AIToolCriteriaEntity {
  id: string
  toolName: string
  followUpText: string
  addedBy: string
  createdAt: Date
  deletedAt: Date | null
}
