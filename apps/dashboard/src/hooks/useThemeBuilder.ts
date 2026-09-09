import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { themeApi } from '@merx/api-client'
import type { ThemeConfig } from '@merx/api-client'

export const THEME_SUMMARY_KEY = ['theme', 'summary'] as const

export function useThemeSummary() {
  return useQuery({
    queryKey: THEME_SUMMARY_KEY,
    queryFn: themeApi.getSummary,
  })
}

export function useCreateDraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: themeApi.createDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THEME_SUMMARY_KEY })
    },
  })
}

export function useApplyPatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: ThemeConfig) => themeApi.applyPatch(config),
    onSuccess: (updatedDraft) => {
      queryClient.setQueryData(THEME_SUMMARY_KEY, (prev: Awaited<ReturnType<typeof themeApi.getSummary>> | undefined) => {
        if (!prev) return prev
        return { ...prev, draft: updatedDraft }
      })
    },
  })
}

export function usePublishTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (forcePublish?: boolean) => themeApi.publish(forcePublish),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THEME_SUMMARY_KEY })
    },
  })
}

export function useRollback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId: string) => themeApi.rollback(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THEME_SUMMARY_KEY })
    },
  })
}
