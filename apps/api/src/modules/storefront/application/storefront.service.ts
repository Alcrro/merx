import Stripe from 'stripe'
import { prisma } from '../../../lib/prisma'
import { config } from '../../../config'
import type { CheckoutInput, CheckoutLineItem } from '../presentation/storefront.schema'

const stripe = new Stripe(config.stripe.secretKey)

export class StorefrontError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'INVALID' | 'OUT_OF_STOCK'
  ) {
    super(message)
    this.name = 'StorefrontError'
  }
}

export class StorefrontService {
  async getStore(slug: string) {
    const store = await prisma.store.findUnique({ where: { slug } })
    if (!store) throw new StorefrontError('Store not found', 'NOT_FOUND')
    return { id: store.id, name: store.name, slug: store.slug, currency: store.currency, locale: store.locale }
  }

  async listProducts(storeId: string, page: number, limit: number, categoryId?: string) {
    const where = { storeId, status: 'active', ...(categoryId ? { categoryId } : {}) }
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true, category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])
    return { data: data.map(toPublicProduct), total, page, limit }
  }

  async getProduct(storeId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId, status: 'active' },
      include: { variants: { include: { inventoryItem: true } }, category: true },
    })
    if (!product) throw new StorefrontError('Product not found', 'NOT_FOUND')
    return toPublicProductDetail(product)
  }

  async listCategories(storeId: string) {
    return prisma.productCategory.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    })
  }

  async createCheckoutSession(storeSlug: string, data: CheckoutInput) {
    const store = await prisma.store.findUnique({ where: { slug: storeSlug } })
    if (!store) throw new StorefrontError('Store not found', 'NOT_FOUND')

    const variantIds = data.items.map((i) => i.variantId)
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, product: { storeId: store.id, status: 'active' } },
      include: { product: true },
    })

    if (variants.length !== variantIds.length) {
      throw new StorefrontError('One or more items are unavailable', 'INVALID')
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = data.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!
      return {
        price_data: {
          currency: store.currency.toLowerCase(),
          product_data: {
            name: `${variant.product.title}${variant.title !== 'Default' ? ` — ${variant.title}` : ''}`,
            metadata: { variantId: variant.id, sku: variant.sku },
          },
          unit_amount: Math.round(Number(variant.price) * 100),
        },
        quantity: item.quantity,
      }
    })

    const itemsMeta: CheckoutLineItem[] = data.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        title: `${variant.product.title}${variant.title !== 'Default' ? ` — ${variant.title}` : ''}`,
        sku: variant.sku,
        unitPrice: Number(variant.price),
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: data.email,
      line_items: lineItems,
      success_url: `${config.server.storefrontUrl}/${storeSlug}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.server.storefrontUrl}/${storeSlug}/checkout`,
      metadata: {
        storeId: store.id,
        storeSlug,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        items: JSON.stringify(itemsMeta),
        shippingAddress: JSON.stringify(data.shippingAddress),
      },
    })

    return { url: session.url! }
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret)
    } catch {
      throw new StorefrontError('Invalid webhook signature', 'INVALID')
    }

    if (event.type !== 'checkout.session.completed') return

    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata!

    const storeId: string = meta.storeId
    const email: string = meta.email
    const firstName: string = meta.firstName ?? null
    const lastName: string = meta.lastName ?? null
    const items: CheckoutLineItem[] = JSON.parse(meta.items)
    const shippingAddress = meta.shippingAddress ? JSON.parse(meta.shippingAddress) : null

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) return

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { storeId_email: { storeId, email } },
        create: { storeId, email, firstName: firstName || null, lastName: lastName || null },
        update: {},
      })

      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

      const order = await tx.order.create({
        data: {
          storeId,
          customerId: customer.id,
          status: 'confirmed',
          paymentStatus: 'paid',
          fulfillmentStatus: 'unfulfilled',
          currency: store.currency,
          subtotal,
          discountTotal: 0,
          taxTotal: 0,
          shippingTotal: 0,
          total: subtotal,
          shippingAddress,
          metadata: { stripeSessionId: session.id },
        },
      })

      await tx.orderItem.createMany({
        data: items.map((i) => ({
          orderId: order.id,
          variantId: i.variantId,
          title: i.title,
          sku: i.sku ?? null,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.unitPrice * i.quantity,
        })),
      })
    })
  }

  async getOrderConfirmation(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session) throw new StorefrontError('Session not found', 'NOT_FOUND')
    return {
      customerEmail: session.customer_details?.email ?? session.metadata?.email,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase() ?? 'EUR',
      status: session.payment_status,
    }
  }
}

export const storefrontService = new StorefrontService()

// ─── helpers ─────────────────────────────────────────────────────────────────

import type { Prisma } from '@prisma/client'

type ProductSummary = Prisma.ProductGetPayload<{ include: { variants: true; category: true } }>
type ProductDetail = Prisma.ProductGetPayload<{ include: { variants: { include: { inventoryItem: true } }; category: true } }>

function mapVariantBase(v: ProductSummary['variants'][number]) {
  return {
    id: v.id,
    sku: v.sku,
    title: v.title,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice !== null ? Number(v.compareAtPrice) : null,
  }
}

function mapProductBase(p: ProductSummary) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    productType: p.productType,
    vendor: p.vendor,
    category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
    createdAt: p.createdAt,
  }
}

function toPublicProduct(p: ProductSummary) {
  return {
    ...mapProductBase(p),
    variants: p.variants.map((v) => ({ ...mapVariantBase(v), inventory: null })),
  }
}

function toPublicProductDetail(p: ProductDetail) {
  return {
    ...mapProductBase(p),
    variants: p.variants.map((v) => ({
      ...mapVariantBase(v),
      inventory: v.inventoryItem
        ? Math.max(0, v.inventoryItem.quantity - v.inventoryItem.reservedQuantity)
        : null,
    })),
  }
}
