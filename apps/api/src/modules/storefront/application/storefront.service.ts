import Stripe from 'stripe'
import { prisma } from '../../../lib/prisma'
import { config } from '../../../config'
import { tenantCache } from '../../../lib/tenant-cache'
import { discountService } from '../../discounts/application/discount.service'
import { DiscountInvalidError, DiscountMaxUsesReachedError } from '../../discounts/domain/errors'
import type { CheckoutInput, CheckoutLineItem } from '../presentation/storefront.schema'

const stripe = new Stripe(config.stripe.secretKey)

// Stripe minimum chargeable amount in major units per currency (approximate)
const STRIPE_MIN_CHARGE: Record<string, number> = {
  EUR: 0.5,
  RON: 2.0,
  USD: 0.5,
  GBP: 0.3,
}

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
    const tenant = await tenantCache.get(`${slug}.merx.com`)
    if (!tenant) throw new StorefrontError('Store not found', 'NOT_FOUND')

    const store = await prisma.store.findUnique({
      where: { id: tenant.storeId },
      select: { id: true, name: true, slug: true, currency: true, locale: true, canonicalHost: true },
    })
    if (!store) throw new StorefrontError('Store not found', 'NOT_FOUND')

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      currency: store.currency,
      locale: store.locale,
      canonicalHost: store.canonicalHost,
    }
  }

  async getStoreMeta(slug: string): Promise<{ noindex: boolean; canonicalHost: string | null }> {
    const store = await prisma.store.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true, themePublishedId: true, canonicalHost: true },
    })
    if (!store) throw new StorefrontError('Store not found', 'NOT_FOUND')

    const publishedProductCount = await prisma.product.count({
      where: { storeId: store.id, status: 'active' },
    })

    const noindex = !store.themePublishedId || publishedProductCount < 3

    return { noindex, canonicalHost: store.canonicalHost }
  }

  async listProducts(storeId: string, page: number, limit: number, categoryId?: string) {
    const where = { storeId, status: 'active', ...(categoryId ? { categoryId } : {}) }
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true, category: true, brand: true, tags: true },
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
      include: { variants: { include: { inventoryItem: true } }, category: true, brand: true, tags: true },
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

    // Subtotal always calculated server-side — never trusted from client
    const subtotal = itemsMeta.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

    // ── Discount reservation ──────────────────────────────────────────────────
    let reservation: { id: string; amount: number; discountCodeId: string } | null = null

    if (data.discountCode) {
      try {
        reservation = await discountService.reserve(store.id, data.discountCode, subtotal)
      } catch (err) {
        if (err instanceof DiscountInvalidError) {
          throw new StorefrontError(err.code, 'INVALID')
        }
        if (err instanceof DiscountMaxUsesReachedError) {
          throw new StorefrontError('CODE_MAX_USES_REACHED', 'INVALID')
        }
        throw err
      }
    }

    const discountAmount = reservation?.amount ?? 0
    let remaining = subtotal - discountAmount
    const stripeMin = STRIPE_MIN_CHARGE[store.currency] ?? 0.5

    // If remaining is below Stripe's minimum but above zero, absorb the difference
    if (remaining > 0 && remaining < stripeMin) {
      remaining = 0
    }

    // ── Free order (no Stripe session needed) ────────────────────────────────
    if (remaining === 0) {
      try {
        await this.createFreeOrder(store, data, itemsMeta, subtotal, discountAmount, reservation)
        return { url: null, free: true }
      } catch (err) {
        if (reservation) await discountService.release('__free__' + reservation.id).catch(() => {})
        throw err
      }
    }

    // ── Paid order via Stripe ─────────────────────────────────────────────────
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

    let stripeCouponId: string | undefined

    try {
      if (reservation) {
        const coupon = await stripe.coupons.create(
          {
            amount_off: Math.round(reservation.amount * 100),
            currency: store.currency.toLowerCase(),
            duration: 'once',
            max_redemptions: 1,
            redeem_by: Math.floor(Date.now() / 1000) + 2 * 3600,
            name: `Reducere: ${data.discountCode}`,
            metadata: { merxReservationId: reservation.id, merxStoreId: store.id },
          },
          { idempotencyKey: `coupon_${reservation.id}` },
        )
        stripeCouponId = coupon.id
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: data.email,
        line_items: lineItems,
        ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
        expires_at: Math.floor(Date.now() / 1000) + 3600,
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
          ...(reservation
            ? {
                reservationId: reservation.id,
                discountCode: data.discountCode!,
                discountAmount: String(reservation.amount),
              }
            : {}),
        },
      })

      if (reservation) {
        await discountService.attachSession(reservation.id, session.id)
      }

      return { url: session.url!, free: false }
    } catch (err) {
      // Compensate: release the slot if anything after reservation fails
      if (reservation) {
        // Mark the reservation with a synthetic session id to allow markReleased
        await prisma.discountReservation.updateMany({
          where: { id: reservation.id, status: 'reserved', stripeSessionId: null },
          data: { stripeSessionId: `orphan_${reservation.id}` },
        })
        await discountService.release(`orphan_${reservation.id}`)
      }
      throw err
    }
  }

  private async createFreeOrder(
    store: { id: string; currency: string },
    data: CheckoutInput,
    itemsMeta: CheckoutLineItem[],
    subtotal: number,
    discountAmount: number,
    reservation: { id: string; discountCodeId: string } | null,
  ) {
    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { storeId_email: { storeId: store.id, email: data.email } },
        create: { storeId: store.id, email: data.email, firstName: data.firstName || null, lastName: data.lastName || null },
        update: {},
      })

      const order = await tx.order.create({
        data: {
          storeId: store.id,
          customerId: customer.id,
          status: 'confirmed',
          paymentStatus: 'paid',
          fulfillmentStatus: 'unfulfilled',
          currency: store.currency,
          subtotal,
          discountTotal: discountAmount,
          discountCodeId: reservation?.discountCodeId ?? null,
          discountCodeSnapshot: data.discountCode ?? null,
          taxTotal: 0,
          shippingTotal: 0,
          total: 0,
          shippingAddress: JSON.parse(JSON.stringify(data.shippingAddress)),
          metadata: { free: true },
        },
      })

      await tx.orderItem.createMany({
        data: itemsMeta.map((i) => ({
          orderId: order.id,
          variantId: i.variantId,
          title: i.title,
          sku: i.sku ?? null,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.unitPrice * i.quantity,
        })),
      })

      for (const item of itemsMeta) {
        if (!item.variantId) continue
        const invItem = await tx.inventoryItem.findUnique({ where: { variantId: item.variantId } })
        if (!invItem) continue
        await tx.inventoryItem.update({
          where: { variantId: item.variantId },
          data: { quantity: { decrement: item.quantity } },
        })
        await tx.inventoryMovement.create({
          data: {
            storeId: store.id,
            variantId: item.variantId,
            type: 'out',
            quantity: -item.quantity,
            note: `Order #${order.orderNumber} (free)`,
            actorType: 'system',
          },
        })
      }

      if (reservation) {
        await tx.discountReservation.update({
          where: { id: reservation.id },
          data: { status: 'consumed', resolvedAt: new Date() },
        })
      }
    })
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret)
    } catch {
      throw new StorefrontError('Invalid webhook signature', 'INVALID')
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleSessionCompleted(event.id, event.data.object as Stripe.Checkout.Session)
        break
      case 'checkout.session.expired':
        await this.handleSessionExpired(event.id, event.data.object as Stripe.Checkout.Session)
        break
      default:
        break
    }
  }

  private async handleSessionCompleted(eventId: string, session: Stripe.Checkout.Session) {
    // Idempotency — Stripe retries on non-2xx; a second delivery must be a no-op
    try {
      await prisma.processedStripeEvent.create({ data: { eventId, type: 'checkout.session.completed' } })
    } catch {
      return // unique violation → already processed
    }

    const meta = session.metadata!
    const storeId: string = meta.storeId
    const email: string = meta.email
    const firstName: string = meta.firstName ?? null
    const lastName: string = meta.lastName ?? null
    const items: CheckoutLineItem[] = JSON.parse(meta.items)
    const shippingAddress = meta.shippingAddress ? JSON.parse(meta.shippingAddress) : null
    const reservationId: string | null = meta.reservationId ?? null
    const discountCode: string | null = meta.discountCode ?? null
    const discountAmount: number = meta.discountAmount ? Number(meta.discountAmount) : 0

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) return

    // Look up reservation before the transaction (read-only, no lock needed)
    const reservation = reservationId
      ? await prisma.discountReservation.findUnique({ where: { id: reservationId } })
      : null

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const total = subtotal - discountAmount

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { storeId_email: { storeId, email } },
        create: { storeId, email, firstName: firstName || null, lastName: lastName || null },
        update: {},
      })

      const order = await tx.order.create({
        data: {
          storeId,
          customerId: customer.id,
          status: 'confirmed',
          paymentStatus: 'paid',
          fulfillmentStatus: 'unfulfilled',
          currency: store.currency,
          subtotal,
          discountTotal: discountAmount,
          discountCodeId: reservation?.discountCodeId ?? null,
          discountCodeSnapshot: discountCode,
          taxTotal: 0,
          shippingTotal: 0,
          total: Math.max(total, 0),
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

      for (const item of items) {
        if (!item.variantId) continue
        const invItem = await tx.inventoryItem.findUnique({ where: { variantId: item.variantId } })
        if (!invItem) continue
        await tx.inventoryItem.update({
          where: { variantId: item.variantId },
          data: { quantity: { decrement: item.quantity } },
        })
        await tx.inventoryMovement.create({
          data: {
            storeId,
            variantId: item.variantId,
            type: 'out',
            quantity: -item.quantity,
            note: `Order #${order.orderNumber}`,
            actorType: 'system',
          },
        })
      }

      // Consume the reservation in the same transaction — atomic with order creation
      if (reservation && reservation.status === 'reserved') {
        await tx.discountReservation.update({
          where: { id: reservation.id },
          data: { status: 'consumed', resolvedAt: new Date() },
        })
      }
    })
  }

  private async handleSessionExpired(eventId: string, session: Stripe.Checkout.Session) {
    try {
      await prisma.processedStripeEvent.create({ data: { eventId, type: 'checkout.session.expired' } })
    } catch {
      return
    }

    await discountService.release(session.id)
  }

  async getPublishedTheme(slug: string) {
    const store = await prisma.store.findFirst({
      where: { slug, deletedAt: null },
      select: { themePublishedId: true },
    })
    if (!store || !store.themePublishedId) return null

    const version = await prisma.themeVersion.findUnique({
      where: { id: store.themePublishedId },
    })
    return version ? (version.config as Record<string, unknown>) : null
  }

  async getPreviewTheme(slug: string, previewId: string) {
    const store = await prisma.store.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    })
    if (!store) return null

    const version = await prisma.themeVersion.findFirst({
      where: { id: previewId, storeId: store.id },
    })
    return version ? (version.config as Record<string, unknown>) : null
  }

  async getOrderConfirmation(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['total_details'],
    })
    if (!session) throw new StorefrontError('Session not found', 'NOT_FOUND')
    const discountCents = session.total_details?.amount_discount ?? 0
    return {
      customerEmail: session.customer_details?.email ?? session.metadata?.email ?? null,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      discountTotal: discountCents > 0 ? discountCents / 100 : null,
      discountCodeSnapshot: session.metadata?.discountCode ?? null,
      currency: session.currency?.toUpperCase() ?? 'EUR',
      status: session.payment_status,
    }
  }
}

export const storefrontService = new StorefrontService()

// ─── helpers ─────────────────────────────────────────────────────────────────

import type { Prisma } from '@prisma/client'

type ProductSummary = Prisma.ProductGetPayload<{ include: { variants: true; category: true; brand: true; tags: true } }>
type ProductDetail = Prisma.ProductGetPayload<{ include: { variants: { include: { inventoryItem: true } }; category: true; brand: true; tags: true } }>

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
    brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug, logoUrl: p.brand.logoUrl } : null,
    tags: p.tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, type: t.type })),
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
