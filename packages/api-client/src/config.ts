import { apiClient } from './client'

export const configApi = {
  getPublic: () =>
    apiClient.get<{ stripePublishableKey: string }>('/config/public').then((r) => r.data),
}
