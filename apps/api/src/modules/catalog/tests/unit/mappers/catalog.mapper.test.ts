import { describe, it, expect } from 'vitest'
import { Prisma } from '@prisma/client'
import { toVariant, toProduct, toStoreProduct, toStoreProductVariant } from '../../../infrastructure/db/mappers/catalog.mapper'

describe('toVariant', () => {
  const base = {
    id: 'v1',
    catalogProductId: 'p1',
    title: 'Red L',
    sku: 'SKU-001',
    suggestedPrice: new Prisma.Decimal('29.99'),
    createdAt: new Date('2024-01-01'),
  }

  it('converts Decimal suggestedPrice to number', () => {
    expect(toVariant(base).suggestedPrice).toBe(29.99)
    expect(typeof toVariant(base).suggestedPrice).toBe('number')
  })

  it('maps images when present', () => {
    const raw = {
      ...base,
      images: [
        { id: 'img1', catalogVariantId: 'v1', url: 'https://cdn/img.jpg', altText: null, position: 0, isPrimary: true, createdAt: new Date() },
      ],
    }
    const result = toVariant(raw)
    expect(result.images).toHaveLength(1)
    expect(result.images?.[0].isPrimary).toBe(true)
    expect(result.images?.[0].altText).toBeNull()
  })

  it('leaves images undefined when not provided', () => {
    expect(toVariant(base).images).toBeUndefined()
  })
})

describe('toProduct', () => {
  const base = {
    id: 'p1',
    title: 'T-Shirt',
    description: 'A shirt',
    categoryId: 'cat1',
    productType: 'clothing',
    status: 'active',
    aiGenerated: false,
    metadata: { color: 'red' } as Prisma.JsonValue,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  }

  it('casts status to CatalogProductStatus', () => {
    expect(toProduct(base).status).toBe('active')
  })

  it('defaults metadata to {} when null', () => {
    expect(toProduct({ ...base, metadata: null as unknown as Prisma.JsonValue }).metadata).toEqual({})
  })

  it('maps storeCount from _count.storeProducts', () => {
    expect(toProduct({ ...base, _count: { storeProducts: 5 } }).storeCount).toBe(5)
  })

  it('leaves storeCount undefined when _count absent', () => {
    expect(toProduct(base).storeCount).toBeUndefined()
  })

  it('maps nested category', () => {
    const result = toProduct({
      ...base,
      category: { id: 'cat1', name: 'Clothing', slug: 'clothing', parentId: null },
    })
    expect(result.category?.name).toBe('Clothing')
    expect(result.category?.parentId).toBeNull()
  })

  it('preserves null category', () => {
    expect(toProduct({ ...base, category: null }).category).toBeNull()
  })

  it('maps variants when present', () => {
    const result = toProduct({
      ...base,
      variants: [
        { id: 'v1', catalogProductId: 'p1', title: 'Red L', sku: 'SKU-1', suggestedPrice: new Prisma.Decimal('10'), createdAt: new Date() },
      ],
    })
    expect(result.variants).toHaveLength(1)
    expect(result.variants?.[0].suggestedPrice).toBe(10)
  })
})

describe('toStoreProduct', () => {
  it('converts shippingCost Decimal to number', () => {
    const raw = {
      id: 'sp1', storeId: 's1', catalogProductId: 'p1',
      addedAt: new Date(),
      shippingCost: new Prisma.Decimal('5.50'),
    }
    expect(toStoreProduct(raw).shippingCost).toBe(5.5)
  })

  it('leaves variants undefined when not provided', () => {
    const raw = {
      id: 'sp1', storeId: 's1', catalogProductId: 'p1',
      addedAt: new Date(), shippingCost: new Prisma.Decimal('0'),
    }
    expect(toStoreProduct(raw).variants).toBeUndefined()
  })
})

describe('toStoreProductVariant', () => {
  it('converts customPrice Decimal to number', () => {
    const raw = { id: 'spv1', storeProductId: 'sp1', catalogVariantId: 'v1', customPrice: new Prisma.Decimal('19.99') }
    expect(toStoreProductVariant(raw).customPrice).toBe(19.99)
  })

  it('maps null customPrice to null', () => {
    const raw = { id: 'spv1', storeProductId: 'sp1', catalogVariantId: 'v1', customPrice: null }
    expect(toStoreProductVariant(raw).customPrice).toBeNull()
  })
})
