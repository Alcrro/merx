/**
 * Seed script — populează DB cu date de test complete:
 *  - Admin user + store owner user
 *  - Store
 *  - CatalogCategory (globale)
 *  - CatalogProduct + CatalogVariant (8 produse)
 *  - StoreProduct + StoreProductVariant (toate importate în store)
 *  - ArchiveCriteria predefinite
 *
 * Usage: node apps/api/scripts/seed.mjs
 */

import { PrismaClient } from '../../../node_modules/.prisma/client/index.js'
import { createHash } from 'crypto'
import { promisify } from 'util'

// bcryptjs via dynamic import (ESM compat)
const { default: bcrypt } = await import('../../../node_modules/bcryptjs/dist/bcrypt.js').catch(() =>
  import('../../../node_modules/bcryptjs/index.js')
)

const prisma = new PrismaClient()

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  console.log('🌱 Seeding database...\n')

  // ─── Users ───────────────────────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash('Admin1234!', 12)
  const ownerPassword = await bcrypt.hash('Owner1234!', 12)
  const testPassword = await bcrypt.hash('Test1234!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@merx.dev' },
    update: {},
    create: {
      email: 'admin@merx.dev',
      password: adminPassword,
      name: 'Admin Merx',
      role: 'admin',
    },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'owner@merx.dev' },
    update: {},
    create: {
      email: 'owner@merx.dev',
      password: ownerPassword,
      name: 'Alexandru Roventa',
      role: 'user',
    },
  })

  // Test: buyer fără magazin (vede "Devino Vânzător" în navbar)
  await prisma.user.upsert({
    where: { email: 'buyer@test.merx.dev' },
    update: {},
    create: {
      email: 'buyer@test.merx.dev',
      password: testPassword,
      name: 'Test Buyer',
      role: 'user',
    },
  })

  // Test: vendor cu magazin (pentru testat intro + wizard mai târziu)
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@test.merx.dev' },
    update: {},
    create: {
      email: 'vendor@test.merx.dev',
      password: testPassword,
      name: 'Test Vendor',
      role: 'user',
    },
  })

  console.log(`✓ Users: admin@merx.dev (Admin1234!) | owner@merx.dev (Owner1234!)`)
  console.log(`✓ Test users: buyer@test.merx.dev (Test1234!) | vendor@test.merx.dev (Test1234!)`)

  // ─── Store ───────────────────────────────────────────────────────────────────

  const store = await prisma.store.upsert({
    where: { slug: 'merx-demo-store' },
    update: {},
    create: {
      ownerId: owner.id,
      name: 'Merx Demo Store',
      slug: 'merx-demo-store',
      currency: 'EUR',
      locale: 'ro',
      timezone: 'Europe/Bucharest',
    },
  })

  const vendorStore = await prisma.store.upsert({
    where: { slug: 'test-vendor-store' },
    update: {},
    create: {
      ownerId: vendorUser.id,
      name: 'Test Vendor Store',
      slug: 'test-vendor-store',
      currency: 'EUR',
      locale: 'ro',
      timezone: 'Europe/Bucharest',
    },
  })

  console.log(`✓ Stores: "${store.name}" | "${vendorStore.name}"`)

  // ─── CatalogCategory ─────────────────────────────────────────────────────────

  const categories = {}

  const roots = [
    { name: 'Electronice', slug: 'electronice' },
    { name: 'Haine', slug: 'haine' },
    { name: 'Accesorii', slug: 'accesorii' },
    { name: 'Sport', slug: 'sport' },
    { name: 'Casă & Grădină', slug: 'casa-gradina' },
  ]

  for (const cat of roots) {
    categories[cat.slug] = await prisma.catalogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    })
  }

  const subs = [
    { name: 'Telefoane', slug: 'telefoane', parent: 'electronice' },
    { name: 'Laptopuri', slug: 'laptopuri', parent: 'electronice' },
    { name: 'Audio', slug: 'audio', parent: 'electronice' },
    { name: 'Tricouri', slug: 'tricouri', parent: 'haine' },
    { name: 'Hanorace', slug: 'hanorace', parent: 'haine' },
    { name: 'Încălțăminte', slug: 'incaltaminte', parent: 'haine' },
    { name: 'Genți', slug: 'genti', parent: 'accesorii' },
    { name: 'Ceasuri', slug: 'ceasuri', parent: 'accesorii' },
  ]

  for (const sub of subs) {
    categories[sub.slug] = await prisma.catalogCategory.upsert({
      where: { slug: sub.slug },
      update: {},
      create: { name: sub.name, slug: sub.slug, parentId: categories[sub.parent].id },
    })
  }

  console.log(`✓ CatalogCategory: ${Object.keys(categories).length} categorii`)

  // ─── CatalogProduct + CatalogVariant ─────────────────────────────────────────

  const products = [
    {
      title: 'iPhone 15 Pro',
      description: 'Smartphone flagship Apple cu chip A17 Pro, cameră de 48MP și ecran Super Retina XDR de 6.1".',
      productType: 'physical',
      categorySlug: 'telefoane',
      variants: [
        { title: '128GB / Titan Natural', sku: 'APL-IP15P-128-TN', suggestedPrice: 1199 },
        { title: '256GB / Titan Negru', sku: 'APL-IP15P-256-TB', suggestedPrice: 1329 },
        { title: '512GB / Titan Alb', sku: 'APL-IP15P-512-TW', suggestedPrice: 1559 },
      ],
    },
    {
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Telefon premium Samsung cu S Pen integrat, ecran Dynamic AMOLED de 6.8" și cameră de 200MP.',
      productType: 'physical',
      categorySlug: 'telefoane',
      variants: [
        { title: '256GB / Titanium Black', sku: 'SAM-S24U-256-BK', suggestedPrice: 1299 },
        { title: '512GB / Titanium Gray', sku: 'SAM-S24U-512-GR', suggestedPrice: 1499 },
      ],
    },
    {
      title: 'MacBook Air M3',
      description: 'Laptop ultraportabil Apple cu chip M3, 15 ore autonomie și ecran Liquid Retina de 13.6".',
      productType: 'physical',
      categorySlug: 'laptopuri',
      variants: [
        { title: '8GB RAM / 256GB SSD / Midnight', sku: 'APL-MBA-M3-8-256-MN', suggestedPrice: 1299 },
        { title: '16GB RAM / 512GB SSD / Starlight', sku: 'APL-MBA-M3-16-512-SL', suggestedPrice: 1699 },
        { title: '24GB RAM / 1TB SSD / Space Gray', sku: 'APL-MBA-M3-24-1T-SG', suggestedPrice: 2099 },
      ],
    },
    {
      title: 'Sony WH-1000XM5',
      description: 'Căști wireless over-ear cu noise cancelling liderar, 30 ore autonomie și sunet Hi-Res Audio.',
      productType: 'physical',
      categorySlug: 'audio',
      variants: [
        { title: 'Negru', sku: 'SNY-WH1000XM5-BK', suggestedPrice: 329 },
        { title: 'Argintiu', sku: 'SNY-WH1000XM5-SV', suggestedPrice: 329 },
      ],
    },
    {
      title: 'Tricou Oversize Premium',
      description: 'Tricou oversize din bumbac 100% organic, croială relaxed fit, disponibil în multiple culori.',
      productType: 'physical',
      categorySlug: 'tricouri',
      variants: [
        { title: 'Alb / S', sku: 'TRC-OVS-WH-S', suggestedPrice: 49 },
        { title: 'Alb / M', sku: 'TRC-OVS-WH-M', suggestedPrice: 49 },
        { title: 'Alb / L', sku: 'TRC-OVS-WH-L', suggestedPrice: 49 },
        { title: 'Negru / S', sku: 'TRC-OVS-BK-S', suggestedPrice: 49 },
        { title: 'Negru / M', sku: 'TRC-OVS-BK-M', suggestedPrice: 49 },
        { title: 'Negru / L', sku: 'TRC-OVS-BK-L', suggestedPrice: 49 },
      ],
    },
    {
      title: 'Hoodie Essential Fleece',
      description: 'Hanorac cu glugă din fleece premium, buzunar kangaroo, șnur reglabil. Perfect pentru sezonul rece.',
      productType: 'physical',
      categorySlug: 'hanorace',
      variants: [
        { title: 'Gri Melange / S', sku: 'HDY-ESS-GR-S', suggestedPrice: 89 },
        { title: 'Gri Melange / M', sku: 'HDY-ESS-GR-M', suggestedPrice: 89 },
        { title: 'Gri Melange / L', sku: 'HDY-ESS-GR-L', suggestedPrice: 89 },
        { title: 'Gri Melange / XL', sku: 'HDY-ESS-GR-XL', suggestedPrice: 89 },
        { title: 'Navy / M', sku: 'HDY-ESS-NV-M', suggestedPrice: 89 },
        { title: 'Navy / L', sku: 'HDY-ESS-NV-L', suggestedPrice: 89 },
      ],
    },
    {
      title: 'Nike Air Max 90',
      description: 'Sneakers clasici Nike cu unitate Air Max la călcâi, talpă din cauciuc și design iconic din 1990.',
      productType: 'physical',
      categorySlug: 'incaltaminte',
      variants: [
        { title: 'Alb-Negru / 40', sku: 'NK-AM90-WB-40', suggestedPrice: 139 },
        { title: 'Alb-Negru / 41', sku: 'NK-AM90-WB-41', suggestedPrice: 139 },
        { title: 'Alb-Negru / 42', sku: 'NK-AM90-WB-42', suggestedPrice: 139 },
        { title: 'Alb-Negru / 43', sku: 'NK-AM90-WB-43', suggestedPrice: 139 },
        { title: 'Alb-Negru / 44', sku: 'NK-AM90-WB-44', suggestedPrice: 139 },
      ],
    },
    {
      title: 'Apple Watch Series 9',
      description: 'Smartwatch Apple cu ecran Always-On Retina, chip S9, monitorizare sănătate avansată și GPS.',
      productType: 'physical',
      categorySlug: 'ceasuri',
      variants: [
        { title: '41mm / Midnight Aluminum', sku: 'APL-AW9-41-MN', suggestedPrice: 429 },
        { title: '45mm / Midnight Aluminum', sku: 'APL-AW9-45-MN', suggestedPrice: 459 },
        { title: '45mm / Starlight Aluminum', sku: 'APL-AW9-45-SL', suggestedPrice: 459 },
      ],
    },
  ]

  const createdStoreProducts = []

  for (const p of products) {
    const catalogProduct = await prisma.catalogProduct.create({
      data: {
        title: p.title,
        description: p.description,
        productType: p.productType,
        status: 'active',
        aiGenerated: false,
        categoryId: categories[p.categorySlug].id,
        variants: { create: p.variants },
      },
      include: { variants: true },
    })

    // Import în store
    const storeProduct = await prisma.storeProduct.create({
      data: {
        storeId: store.id,
        catalogProductId: catalogProduct.id,
        variants: {
          create: catalogProduct.variants.map((v) => ({
            catalogVariantId: v.id,
            customPrice: null,
          })),
        },
      },
    })

    createdStoreProducts.push(storeProduct)
    console.log(`  ✓ ${p.title} (${p.variants.length} variante)`)
  }

  console.log(`\n✓ CatalogProduct: ${products.length} produse`)
  console.log(`✓ StoreProduct: ${createdStoreProducts.length} importate în "${store.name}"`)

  // ─── ArchiveCriteria predefinite ─────────────────────────────────────────────

  const archiveCriteria = [
    { name: 'Fără vânzări 6 luni', criteriaKey: 'no_sales_months', value: '6', enabled: true },
    { name: 'Rating mediu sub 2', criteriaKey: 'low_rating', value: '2.0', enabled: false },
    { name: 'Cereri respinse repetat', criteriaKey: 'rejected_requests', value: '3', enabled: true },
    { name: 'Fără variantă activă', criteriaKey: 'no_active_variants', value: 'true', enabled: true },
    { name: 'Niciodată adăugat în store (3 luni)', criteriaKey: 'never_added_to_store', value: '3', enabled: true },
  ]

  for (const ac of archiveCriteria) {
    await prisma.archiveCriteria.upsert({
      where: { criteriaKey: ac.criteriaKey },
      update: {},
      create: ac,
    })
  }

  console.log(`✓ ArchiveCriteria: ${archiveCriteria.length} criterii predefinite`)

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Seed complet!

Login admin:   admin@merx.dev  / Admin1234!
Login owner:   owner@merx.dev  / Owner1234!
Buyer (fără magazin): buyer@test.merx.dev  / Test1234!
Vendor (cu magazin):  vendor@test.merx.dev / Test1234!

Store demo ID:   ${store.id}
Store vendor ID: ${vendorStore.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

main()
  .catch((e) => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
