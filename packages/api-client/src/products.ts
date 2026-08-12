import type { Product, ProductVariant, ProductCategory, PaginatedResponse, ProductStatus } from '@merx/types'
import { apiClient } from './index'

export interface ListProductsParams {
  status?: ProductStatus
  categoryId?: string
  page?: number
  limit?: number
}

export interface CreateProductInput {
  title: string
  description?: string | null
  status?: ProductStatus
  categoryId?: string | null
  productType?: string | null
  vendor?: string | null
}

export interface CreateVariantInput {
  sku: string
  title: string
  price: number
  compareAtPrice?: number | null
  cost?: number | null
  weight?: number | null
}

export const productApi = {
  list: (params?: ListProductsParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: CreateProductInput) =>
    apiClient.post<Product>('/products', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateProductInput>) =>
    apiClient.put<Product>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),

  createVariant: (productId: string, data: CreateVariantInput) =>
    apiClient.post<ProductVariant>(`/products/${productId}/variants`, data).then((r) => r.data),

  updateVariant: (productId: string, variantId: string, data: Partial<CreateVariantInput>) =>
    apiClient.put<ProductVariant>(`/products/${productId}/variants/${variantId}`, data).then((r) => r.data),

  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete(`/products/${productId}/variants/${variantId}`),

  listCategories: () =>
    apiClient.get<ProductCategory[]>('/product-categories').then((r) => r.data),

  createCategory: (name: string) =>
    apiClient.post<ProductCategory>('/product-categories', { name }).then((r) => r.data),
}
