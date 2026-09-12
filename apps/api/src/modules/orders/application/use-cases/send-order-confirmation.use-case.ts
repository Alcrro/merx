import { prisma } from '../../../../lib/prisma'
import { emailService } from '../../../email/email.service'

export class SendOrderConfirmationUseCase {
  async execute(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true },
    })
    if (!order || !order.customer?.email) return

    const store = await prisma.store.findUnique({
      where: { id: order.storeId },
      select: { name: true, currency: true, settings: true, owner: { select: { email: true } } },
    })
    if (!store) return

    const settings = store.settings as Record<string, unknown> | null
    const merchantEmail = (settings?.notificationEmail as string | undefined) ?? store.owner.email

    await emailService.sendOrderConfirmation({
      orderNumber: order.orderNumber,
      storeName: store.name,
      customerEmail: order.customer.email,
      merchantEmail,
      shippingAddress: order.shippingAddress as Record<string, unknown> | null,
      items: order.items.map((i) => ({
        title: i.title,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      taxTotal: Number(order.taxTotal),
      total: Number(order.total),
      currency: store.currency,
    }).catch(() => {})
  }
}

export const sendOrderConfirmationUseCase = new SendOrderConfirmationUseCase()
