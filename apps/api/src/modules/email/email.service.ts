import { config } from '../../config'
import { ResendProvider } from './infrastructure/resend.provider'
import type { IEmailProvider } from './domain/email-provider.port'
import { orderConfirmationHtml, type OrderConfirmationData } from './templates/order-confirmation'
import { newOrderAlertHtml } from './templates/new-order-alert'
export type { OrderConfirmationData }

export interface NewOrderAlertData {
  orderNumber: number
  storeName: string
  merchantEmail: string
  customerEmail: string
  total: number
  currency: string
  items: Array<{ title: string; quantity: number; unitPrice: number }>
  createdAt: Date
}

class EmailService {
  constructor(private readonly provider: IEmailProvider | null) {}

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    if (!this.provider) return
    await this.provider.send({
      from: config.email.from,
      to: data.customerEmail,
      subject: `Comandă confirmată #${data.orderNumber} — ${data.storeName}`,
      html: orderConfirmationHtml(data),
      ...(data.merchantEmail ? { replyTo: data.merchantEmail } : {}),
    })
  }

  async sendNewOrderAlert(data: NewOrderAlertData): Promise<void> {
    if (!this.provider) return
    await this.provider.send({
      from: config.email.from,
      to: data.merchantEmail,
      subject: `Comandă nouă #${data.orderNumber} — ${data.storeName}`,
      html: newOrderAlertHtml(data),
    })
  }

}

const provider = config.email.apiKey ? new ResendProvider(config.email.apiKey) : null

export const emailService = new EmailService(provider)
