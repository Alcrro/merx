import { PrismaClient } from '../../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()
const STORE_ID = '7bd80b7a-9c16-4773-a802-4673908e1d20'

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  // ─── Categorii root ───────────────────────────────────────────────────────
  const electronice = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'electronice' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Electronice', slug: 'electronice', parentId: null },
  })

  const haine = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'haine' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Haine', slug: 'haine', parentId: null },
  })

  const accesorii = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'accesorii' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Accesorii', slug: 'accesorii', parentId: null },
  })

  // ─── Subcategorii Electronice ─────────────────────────────────────────────
  const telefoane = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'telefoane' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Telefoane', slug: 'telefoane', parentId: electronice.id },
  })

  const laptopuri = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'laptopuri' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Laptopuri', slug: 'laptopuri', parentId: electronice.id },
  })

  const audio = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'audio' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Audio', slug: 'audio', parentId: electronice.id },
  })

  const smartwatch = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'smartwatch' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Smartwatch', slug: 'smartwatch', parentId: electronice.id },
  })

  const incarcatoare = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'incarcatoare' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Încărcătoare', slug: 'incarcatoare', parentId: electronice.id },
  })

  // ─── Subcategorii Haine ───────────────────────────────────────────────────
  const tricouri = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'tricouri' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Tricouri', slug: 'tricouri', parentId: haine.id },
  })

  const hanorace = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'hanorace' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Hanorace', slug: 'hanorace', parentId: haine.id },
  })

  // ─── Subcategorii Accesorii ───────────────────────────────────────────────
  const genti = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: STORE_ID, slug: 'genti' } },
    update: {},
    create: { storeId: STORE_ID, name: 'Genți', slug: 'genti', parentId: accesorii.id },
  })

  console.log('✓ Categorii create')

  // ─── Asociere produse ─────────────────────────────────────────────────────
  const mapping = [
    { title: 'iPhone 15 Pro',         categoryId: telefoane.id },
    { title: 'MacBook Air M3',        categoryId: laptopuri.id },
    { title: 'AirPods Pro 2',         categoryId: audio.id },
    { title: 'Tricou Oversize Premium', categoryId: tricouri.id },
    { title: 'Hoodie Essential',      categoryId: hanorace.id },
    { title: 'Geantă Laptop 15"',     categoryId: genti.id },
    { title: 'Ceas Smart Watch X200', categoryId: smartwatch.id },
    { title: 'Încărcător MagSafe 15W', categoryId: incarcatoare.id },
  ]

  for (const { title, categoryId } of mapping) {
    const result = await prisma.product.updateMany({
      where: { storeId: STORE_ID, title },
      data: { categoryId },
    })
    console.log(`✓ ${title} → ${result.count} produs actualizat`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
