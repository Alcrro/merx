import type { IntroStateResponse, IntroCompleteResponse } from '@merx/types'
import { apiClient } from './client'

export const introApi = {
  getState: () =>
    apiClient.get<IntroStateResponse>('/users/intro').then((r) => r.data),

  complete: (name: string) =>
    apiClient.post<IntroCompleteResponse>('/users/intro/complete', { name }).then((r) => r.data),
}
