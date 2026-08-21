import Stripe from 'stripe'
import { config } from '../config'

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2026-07-29.dahlia',
})

const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
  'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT',
  'RO', 'SK', 'SI', 'ES', 'SE',
])

export interface EarningsBreakdown {
  amount: number
  stripeFee: number
  merxCommission: number
  sellerPayout: number
  currency: string
}

export function calculateBreakdown(
  amount: number,
  currency: string,
  buyerCountry = 'RO'
): EarningsBreakdown {
  const isEU = EU_COUNTRIES.has(buyerCountry.toUpperCase())
  const stripeFeePercent = isEU ? 0.014 : 0.029
  const stripeFeeFixed = 0.25
  const merxPercent = 0.02

  const stripeFee = +(amount * stripeFeePercent + stripeFeeFixed).toFixed(2)
  const merxCommission = +(amount * merxPercent).toFixed(2)
  const sellerPayout = +(amount - stripeFee - merxCommission).toFixed(2)

  return { amount, stripeFee, merxCommission, sellerPayout, currency }
}
