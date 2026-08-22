import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '@merx/api-client'
import type { ListOrdersParams, CreateOrderInput } from '@merx/api-client'
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '@merx/types'

export const orderKeys = {
  all: ['orders'] as const,
  list: (params?: ListOrdersParams) => ['orders', 'list', params] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
}

export function useOrders(params?: ListOrdersParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.list(params),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.get(id),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrderInput) => orderApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  })
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: OrderStatus) => orderApi.updateStatus(id, status),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}

export function useUpdatePaymentStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (paymentStatus: PaymentStatus) => orderApi.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}

export function useUpdateFulfillmentStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (fulfillmentStatus: FulfillmentStatus) => orderApi.updateFulfillmentStatus(id, fulfillmentStatus),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}

export function useCancelOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => orderApi.cancel(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}

export function useRefundOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amount?: number) => orderApi.refund(id, amount),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}
