import { PrismaClient } from '../../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

async function main() {
  const USER_EMAIL = 'alex.roventa94@gmail.com'

  const user = await prisma.user.findUnique({ where: { email: USER_EMAIL } })
  if (!user) throw new Error(`User ${USER_EMAIL} not found`)

  const stores = await prisma.store.findMany({
    where: { ownerId: user.id, deletedAt: null },
    include: {
      _count: { select: { storeProducts: true, orders: true } },
    },
  })

  console.log(`\nStores pentru ${USER_EMAIL}:`)
  for (const s of stores) {
    console.log(`  id=${s.id} slug="${s.slug}" name="${s.name}" produse=${s._count.storeProducts} comenzi=${s._count.orders}`)
  }

  if (stores.length <= 1) {
    console.log('\nNici un duplicat găsit. Nimic de făcut.')
    return
  }

  // Păstrează store-ul cu slug 'alcrro' (cel seeded cu produse+comenzi)
  const keep = stores.find((s) => s.slug === 'alcrro') ?? stores.sort((a, b) => b._count.orders - a._count.orders)[0]
  const toDelete = stores.filter((s) => s.id !== keep.id)

  console.log(`\nPăstrez: id=${keep.id} slug="${keep.slug}"`)
  console.log(`Șterg: ${toDelete.map((s) => `id=${s.id} slug="${s.slug}"`).join(', ')}`)

  for (const s of toDelete) {
    // Soft delete — setează deletedAt în loc să șteargă hard
    await prisma.store.update({
      where: { id: s.id },
      data: { deletedAt: new Date() },
    })
    console.log(`✓ Store "${s.slug}" (${s.id}) marcat ca deleted`)
  }

  console.log('\n✅ Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
