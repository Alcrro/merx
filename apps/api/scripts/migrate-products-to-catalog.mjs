/**
 * Migrate existing Product records to the catalog system.
 *
 * For each unmigrated Product + ProductVariant:
 *  1. CatalogProduct.create (status: active, aiGenerated: false)
 *  2. CatalogVariant.createMany (suggestedPrice = variant.price)
 *  3. StoreProduct.create (join store ↔ catalogProduct)
 *  4. StoreProductVariant.createMany (customPrice = null → uses suggestedPrice)
 *  5. Product.update { migratedToCatalogAt: now }
 *
 * Original Product + ProductVariant records are KEPT intact.
 * Orders and inventory still reference ProductVariant — nothing breaks.
 *
 * Usage: node apps/api/scripts/migrate-products-to-catalog.mjs [--dry-run]
 */

import { PrismaClient } from '../../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')

if (DRY_RUN) {
  console.log('[migrate] DRY RUN — no changes will be written\n')
}

async function main() {
  const products = await prisma.product.findMany({
    where: { migratedToCatalogAt: null },
    include: { variants: true },
  })

  console.log(`[migrate] Found ${products.length} unmigrated product(s)`)

  let migrated = 0
  let skipped = 0
  const errors = []

  for (const product of products) {
    if (product.variants.length === 0) {
      console.log(`  [skip] "${product.title}" — no variants`)
      skipped++
      continue
    }

    try {
      if (!DRY_RUN) {
        await prisma.$transaction(async (tx) => {
          // 1. Create CatalogProduct
          const catalogProduct = await tx.catalogProduct.create({
            data: {
              title: product.title,
              description: product.description ?? undefined,
              productType: product.productType ?? undefined,
              status: 'active',
              aiGenerated: false,
              metadata: {},
            },
          })

          // 2. Create CatalogVariants
          const catalogVariants = await Promise.all(
            product.variants.map((v) =>
              tx.catalogVariant.create({
                data: {
                  catalogProductId: catalogProduct.id,
                  title: v.title,
                  sku: `CAT-${v.sku}`,
                  suggestedPrice: v.price,
                },
              })
            )
          )

          // 3. Create StoreProduct (join)
          const storeProduct = await tx.storeProduct.create({
            data: { storeId: product.storeId, catalogProductId: catalogProduct.id },
          })

          // 4. Create StoreProductVariants (no price override — uses suggestedPrice)
          await tx.storeProductVariant.createMany({
            data: catalogVariants.map((cv) => ({
              storeProductId: storeProduct.id,
              catalogVariantId: cv.id,
              customPrice: null,
            })),
          })

          // 5. Mark original product as migrated
          await tx.product.update({
            where: { id: product.id },
            data: { migratedToCatalogAt: new Date() },
          })
        })
      }

      const variantCount = product.variants.length
      console.log(`  [ok] "${product.title}" — ${variantCount} variant(s)${DRY_RUN ? ' (dry)' : ''}`)
      migrated++
    } catch (err) {
      console.error(`  [error] "${product.title}":`, err.message)
      errors.push({ title: product.title, error: err.message })
    }
  }

  console.log(`\n[migrate] Done`)
  console.log(`  Migrated: ${migrated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors.length}`)

  if (errors.length > 0) {
    console.log('\nFailed products:')
    errors.forEach((e) => console.log(`  - ${e.title}: ${e.error}`))
    process.exit(1)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
