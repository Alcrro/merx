import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiToolCriteriaApi } from '@merx/api-client'
import type { AIToolName } from '@merx/api-client'

export const criteriaKeys = {
  all: ['ai-tool-criteria'] as const,
  byTool: (toolName: AIToolName) => ['ai-tool-criteria', toolName] as const,
}

export function useToolCriteria(toolName: AIToolName) {
  return useQuery({
    queryKey: criteriaKeys.byTool(toolName),
    queryFn: () => aiToolCriteriaApi.list(toolName),
  })
}

export function useAddFollowUp(toolName: AIToolName) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (followUpText: string) => aiToolCriteriaApi.add(toolName, followUpText),
    onSuccess: () => qc.invalidateQueries({ queryKey: criteriaKeys.byTool(toolName) }),
  })
}

export function useDeleteFollowUp(toolName: AIToolName) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => aiToolCriteriaApi.remove(toolName, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: criteriaKeys.byTool(toolName) }),
  })
}
