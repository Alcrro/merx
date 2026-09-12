/**
 * Backfill v1 → v2 order statuses.
 * Run once with ORDER_V2_ENABLED=false before enabling v2.
 *
 * Usage: ORDER_V2_ENABLED=false npx tsx src/scripts/backfill-orders-v2.ts
 */
import { prisma } from '../lib/prisma'

async function main(): Promise<void> {
  if (process.env.ORDER_V2_ENABLED === 'true') {
    console.error('ERROR: Set ORDER_V2_ENABLED=false before running this script.')
    process.exit(1)
  }

  const result = await prisma.$executeRaw`
    UPDATE orders SET
      status = CASE status
        WHEN 'pending'   THEN 'ACTIVE'
        WHEN 'confirmed' THEN 'ACTIVE'
        WHEN 'completed' THEN 'COMPLETED'
        WHEN 'cancelled' THEN 'CANCELLED'
        ELSE status
      END,
      payment_status = CASE status
        WHEN 'pending'   THEN 'PENDING'
        WHEN 'confirmed' THEN 'PAID'
        WHEN 'completed' THEN 'PAID'
        WHEN 'cancelled' THEN 'VOID'
        ELSE payment_status
      END,
      fulfillment_status = CASE status
        WHEN 'confirmed' THEN 'UNFULFILLED'
        WHEN 'completed' THEN 'FULFILLED'
        ELSE 'UNFULFILLED'
      END
    WHERE status IN ('pending', 'confirmed', 'completed', 'cancelled')
  `

  console.log(`Backfill done. Rows updated: ${result}`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
