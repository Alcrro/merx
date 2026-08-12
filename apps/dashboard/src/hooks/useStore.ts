import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { storeApi } from '@merx/api-client'
import type { UpdateStoreInput } from '@merx/api-client'

export const STORE_QUERY_KEY = ['store', 'current'] as const

export function useStore() {
  return useQuery({
    queryKey: STORE_QUERY_KEY,
    queryFn: storeApi.getCurrent,
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateStoreInput) => storeApi.updateCurrent(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(STORE_QUERY_KEY, updated)
    },
  })
}
