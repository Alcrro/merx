import { PrismaClient } from '../../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

const USER_ID = '32dba5fe-4d04-4efe-bcbc-b95c7b2d4c7b'

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function main() {
  // ─── Store ───────────────────────────────────────────────────────────────────

  const store = await prisma.store.upsert({
    where: { slug: 'alcrro' },
    update: {},
    create: {
      ownerId: USER_ID,
      name: 'alcrro',
      slug: 'alcrro',
      currency: 'EUR',
      locale: 'ro',
      timezone: 'Europe/Bucharest',
    },
  })
  console.log(`✓ Store: "${store.name}" (id: ${store.id})`)

  // ─── Import toate produsele din catalog ──────────────────────────────────────

  const catalogProducts = await prisma.catalogProduct.findMany({
    where: { status: 'active' },
    include: { variants: true },
  })

  let importedCount = 0
  const storeProducts = []

  for (const cp of catalogProducts) {
    const existing = await prisma.storeProduct.findUnique({
      where: { storeId_catalogProductId: { storeId: store.id, catalogProductId: cp.id } },
      include: { variants: true },
    })

    if (existing) {
      storeProducts.push(existing)
      continue
    }

    const sp = await prisma.storeProduct.create({
      data: {
        storeId: store.id,
        catalogProductId: cp.id,
        variants: {
          create: cp.variants.map((v) => ({
            catalogVariantId: v.id,
            customPrice: null,
          })),
        },
      },
      include: { variants: { include: { catalogVariant: true } } },
    })
    storeProducts.push(sp)
    importedCount++
  }
  console.log(`✓ StoreProduct: ${importedCount} importate, ${storeProducts.length - importedCount} existente`)

  // ─── Clienți ─────────────────────────────────────────────────────────────────

  const clientData = [
    { email: 'maria.popescu@gmail.com', firstName: 'Maria', lastName: 'Popescu' },
    { email: 'ion.ionescu@yahoo.com', firstName: 'Ion', lastName: 'Ionescu' },
    { email: 'andrei.mihai@outlook.com', firstName: 'Andrei', lastName: 'Mihai' },
    { email: 'elena.constantin@gmail.com', firstName: 'Elena', lastName: 'Constantin' },
    { email: 'vlad.radu@gmail.com', firstName: 'Vlad', lastName: 'Radu' },
    { email: 'ana.gheorghe@yahoo.com', firstName: 'Ana', lastName: 'Gheorghe' },
    { email: 'bogdan.popa@gmail.com', firstName: 'Bogdan', lastName: 'Popa' },
    { email: 'cristina.stan@gmail.com', firstName: 'Cristina', lastName: 'Stan' },
  ]

  const customers = []
  for (const c of clientData) {
    const customer = await prisma.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: c.email } },
      update: {},
      create: { storeId: store.id, ...c },
    })
    customers.push(customer)
  }
  console.log(`✓ Customers: ${customers.length}`)

  // ─── Comenzi ─────────────────────────────────────────────────────────────────

  const orderStatuses = ['pending', 'confirmed', 'confirmed', 'confirmed', 'completed', 'completed', 'completed', 'cancelled']
  const paymentStatuses = ['pending', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'failed']
  const fulfillmentStatuses = ['unfulfilled', 'unfulfilled', 'fulfilled', 'fulfilled', 'fulfilled', 'fulfilled', 'fulfilled', 'unfulfilled']

  const cities = ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Brașov', 'Oradea']

  // Colectează toate variantele cu prețuri
  const allVariants = []
  for (const sp of storeProducts) {
    const fullSp = await prisma.storeProduct.findUnique({
      where: { id: sp.id },
      include: {
        catalogProduct: true,
        variants: { include: { catalogVariant: true } },
      },
    })
    for (const spv of fullSp.variants) {
      allVariants.push({
        catalogTitle: fullSp.catalogProduct.title,
        variantTitle: spv.catalogVariant.title,
        price: Number(spv.customPrice ?? spv.catalogVariant.suggestedPrice),
        catalogVariantId: spv.catalogVariantId,
      })
    }
  }

  let ordersCreated = 0
  const orderScenarios = [
    { daysBack: 1, statusIdx: 1 },
    { daysBack: 2, statusIdx: 2 },
    { daysBack: 3, statusIdx: 2 },
    { daysBack: 5, statusIdx: 4 },
    { daysBack: 7, statusIdx: 4 },
    { daysBack: 8, statusIdx: 4 },
    { daysBack: 10, statusIdx: 4 },
    { daysBack: 12, statusIdx: 4 },
    { daysBack: 14, statusIdx: 5 },
    { daysBack: 15, statusIdx: 5 },
    { daysBack: 16, statusIdx: 4 },
    { daysBack: 18, statusIdx: 4 },
    { daysBack: 20, statusIdx: 5 },
    { daysBack: 22, statusIdx: 6 },
    { daysBack: 25, statusIdx: 6 },
    { daysBack: 28, statusIdx: 4 },
    { daysBack: 30, statusIdx: 6 },
    { daysBack: 32, statusIdx: 6 },
    { daysBack: 35, statusIdx: 7 },
    { daysBack: 40, statusIdx: 4 },
  ]

  for (const scenario of orderScenarios) {
    const customer = pick(customers)
    const city = pick(cities)
    const numItems = rand(1, 3)
    const selectedVariants = []
    for (let i = 0; i < numItems; i++) {
      selectedVariants.push(pick(allVariants))
    }

    const subtotal = selectedVariants.reduce((sum, v) => sum + v.price, 0)
    const shippingTotal = subtotal > 200 ? 0 : 15
    const total = subtotal + shippingTotal

    const orderDate = daysAgo(scenario.daysBack)

    await prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customer.id,
        status: orderStatuses[scenario.statusIdx],
        paymentStatus: paymentStatuses[scenario.statusIdx],
        fulfillmentStatus: fulfillmentStatuses[scenario.statusIdx],
        currency: 'EUR',
        subtotal,
        taxTotal: 0,
        shippingTotal,
        total,
        shippingAddress: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          address1: `Str. Exemplu nr. ${rand(1, 100)}`,
          city,
          country: 'RO',
          zip: `${rand(100000, 999999)}`,
        },
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: selectedVariants.map((v) => ({
            title: `${v.catalogTitle} — ${v.variantTitle}`,
            sku: null,
            quantity: 1,
            unitPrice: v.price,
            total: v.price,
          })),
        },
      },
    })
    ordersCreated++
  }

  console.log(`✓ Orders: ${ordersCreated} comenzi pe ultimele 40 zile`)

  // ─── Inventar (InventoryItem) ─────────────────────────────────────────────────
  // Nu avem ProductVariant pentru catalog (inventarul e pe Product/ProductVariant vechi)
  // Skipuit — inventarul se va face când se implementează inventar per CatalogVariant

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Store "alcrro" populat!

Store ID:  ${store.id}
Produse:   ${storeProducts.length} din catalog
Clienți:   ${customers.length}
Comenzi:   ${ordersCreated}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

main()
  .catch((e) => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
