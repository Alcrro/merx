import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiApi } from '@merx/api-client'

export const aiKeys = {
  all: ['ai'] as const,
  sessions: ['ai', 'sessions'] as const,
  session: (id: string) => ['ai', 'session', id] as const,
}

export function useSessions() {
  return useQuery({
    queryKey: aiKeys.sessions,
    queryFn: () => aiApi.listSessions(),
  })
}

export function useSession(id: string | null) {
  return useQuery({
    queryKey: aiKeys.session(id ?? ''),
    queryFn: () => aiApi.getSession(id!),
    enabled: !!id,
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title?: string }) => aiApi.createSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.sessions }),
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => aiApi.deleteSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.sessions }),
  })
}
