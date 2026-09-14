import { randomUUID } from 'crypto'
import { prisma } from '../../../lib/prisma'
import { storageProvider } from '../../../lib/storage'
import { stripe } from '../../../lib/stripe'
import { ResendProvider } from '../../email/infrastructure/resend.provider'
import { config } from '../../../config'
import type { BillingInvoice, ActiveSubscription } from '../../billing/domain/types'

interface ExportData {
  exportedAt: string
  profile: {
    id: string
    name: string | null
    email: string
    preferredLocale: string
    planStatus: string
    planId: string | null
    trialEndsAt: string
    createdAt: string
    emailVerified: boolean
  }
  billing: {
    subscription: ActiveSubscription | null
    invoices: BillingInvoice[]
  }
}

export class DataExportService {
  private emailProvider = new ResendProvider(config.email.apiKey)

  async generateAndSend(userId: string): Promise<void> {
    const data = await this.gatherData(userId)
    const runId = randomUUID()
    const prefix = `exports/${userId}/${runId}`

    const [jsonUrl, csvUrl] = await Promise.all([
      this.uploadJson(prefix, data),
      this.uploadCsv(prefix, data.billing.invoices),
    ])

    await this.sendEmail(data.profile.email, data.profile.name, jsonUrl, csvUrl)
  }

  private async gatherData(userId: string): Promise<ExportData> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        preferredLocale: true,
        planStatus: true,
        planId: true,
        trialEndsAt: true,
        createdAt: true,
        emailVerified: true,
        stripeCustomerId: true,
      },
    })

    let subscription: ActiveSubscription | null = null
    let invoices: BillingInvoice[] = []

    if (user.stripeCustomerId) {
      const [subResult, invoiceResult] = await Promise.allSettled([
        this.fetchSubscription(user.stripeCustomerId),
        this.fetchInvoices(user.stripeCustomerId),
      ])
      if (subResult.status === 'fulfilled') subscription = subResult.value
      if (invoiceResult.status === 'fulfilled') invoices = invoiceResult.value
    }

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredLocale: user.preferredLocale,
        planStatus: user.planStatus,
        planId: user.planId,
        trialEndsAt: user.trialEndsAt.toISOString(),
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerified,
      },
      billing: { subscription, invoices },
    }
  }

  private async fetchSubscription(customerId: string): Promise<ActiveSubscription | null> {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price'],
    })
    if (subs.data.length === 0) return null

    const sub = subs.data[0]
    const item = sub.items.data[0]
    const price = item.price
    const productId = typeof price.product === 'string' ? price.product : price.product.id
    const product = await stripe.products.retrieve(productId)

    return {
      subscriptionId: sub.id,
      itemId: item.id,
      planName: product.name,
      priceId: price.id,
      priceAmount: price.unit_amount ?? 0,
      currency: price.currency,
      interval: price.recurring?.interval ?? 'month',
      startsAt: (sub as unknown as { current_period_start: number }).current_period_start,
      renewsAt: (sub as unknown as { current_period_end: number }).current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    }
  }

  private async fetchInvoices(customerId: string): Promise<BillingInvoice[]> {
    const result = await stripe.invoices.list({ customer: customerId, limit: 100 })
    return result.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      date: inv.created,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status as BillingInvoice['status'],
      pdfUrl: inv.invoice_pdf ?? null,
    }))
  }

  private async uploadJson(prefix: string, data: ExportData): Promise<string> {
    const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8')
    return storageProvider.upload(`${prefix}/data.json`, buffer, 'application/json')
  }

  private async uploadCsv(prefix: string, invoices: BillingInvoice[]): Promise<string> {
    const header = 'Invoice Number,Date,Amount,Currency,Status,PDF URL\n'
    const rows = invoices.map((inv) => {
      const date = new Date(inv.date * 1000).toISOString().split('T')[0]
      const amount = (inv.amount / 100).toFixed(2)
      const pdfUrl = inv.pdfUrl ?? ''
      return `${inv.number ?? inv.id},${date},${amount},${inv.currency.toUpperCase()},${inv.status},${pdfUrl}`
    })
    const buffer = Buffer.from(header + rows.join('\n'), 'utf-8')
    return storageProvider.upload(`${prefix}/invoices.csv`, buffer, 'text/csv')
  }

  private async sendEmail(email: string, name: string | null, jsonUrl: string, csvUrl: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
    const greeting = name ? `Hi ${name},` : 'Hi,'

    await this.emailProvider.send({
      from: config.email.from,
      to: email,
      subject: 'Your Merx data export is ready',
      html: `
        <p>${greeting}</p>
        <p>Your data export has been generated. Download your files using the links below:</p>
        <ul>
          <li><a href="${jsonUrl}">Complete data (JSON)</a></li>
          <li><a href="${csvUrl}">Invoices (CSV)</a></li>
        </ul>
        <p>These links expire on <strong>${expiresAt}</strong>.</p>
        <p>The Merx Team</p>
      `,
    })
  }
}

export const dataExportService = new DataExportService()
