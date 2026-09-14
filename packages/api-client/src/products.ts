import type { Product, ProductImage, ProductVariant, ProductCategory, Brand, Tag, ProductAnalytics, PaginatedResponse, ProductStatus } from '@merx/types'
import { apiClient } from './client'

export interface ListProductsParams {
  status?: ProductStatus
  categoryId?: string
  brandId?: string
  tagIds?: string
  page?: number
  limit?: number
}

export interface CreateProductInput {
  title: string
  description?: string | null
  status?: ProductStatus
  categoryId?: string | null
  brandId?: string | null
  productType?: string | null
  tagIds?: string[]
}

export interface CreateBrandInput {
  name: string
  logoUrl?: string | null
}

export interface CreateTagInput {
  name: string
  type?: string
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

  getAnalytics: (id: string) =>
    apiClient.get<ProductAnalytics>(`/products/${id}/analytics`).then((r) => r.data),

  listCategories: () =>
    apiClient.get<ProductCategory[]>('/product-categories').then((r) => r.data),

  createCategory: (data: { name: string; parentId?: string | null }) =>
    apiClient.post<ProductCategory>('/product-categories', data).then((r) => r.data),

  deleteCategory: (id: string) =>
    apiClient.delete(`/product-categories/${id}`),

  listBrands: () =>
    apiClient.get<Brand[]>('/brands').then((r) => r.data),

  createBrand: (data: CreateBrandInput) =>
    apiClient.post<Brand>('/brands', data).then((r) => r.data),

  updateBrand: (id: string, data: Partial<CreateBrandInput>) =>
    apiClient.put<Brand>(`/brands/${id}`, data).then((r) => r.data),

  deleteBrand: (id: string) =>
    apiClient.delete(`/brands/${id}`),

  listTags: (type?: string) =>
    apiClient.get<Tag[]>('/tags', { params: { type } }).then((r) => r.data),

  createTag: (data: CreateTagInput) =>
    apiClient.post<Tag>('/tags', data).then((r) => r.data),

  deleteTag: (id: string) =>
    apiClient.delete(`/tags/${id}`),

  uploadImage: (productId: string, file: File) => {
    const form = new FormData()
    form.append('image', file)
    return apiClient.post<ProductImage>(`/products/${productId}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  deleteImage: (productId: string, imageId: string) =>
    apiClient.delete(`/products/${productId}/images/${imageId}`),

  reorderImages: (productId: string, ids: string[]) =>
    apiClient.patch(`/products/${productId}/images/reorder`, { ids }),
}
