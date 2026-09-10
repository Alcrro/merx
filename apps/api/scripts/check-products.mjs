import { PrismaClient } from '../../../node_modules/.prisma/client/index.js'
const prisma = new PrismaClient()

const USER_ID = '32dba5fe-4d04-4efe-bcbc-b95c7b2d4c7b'

const stores = await prisma.store.findMany({
  where: { ownerId: USER_ID },
  select: { id: true, name: true, slug: true, deletedAt: true },
})
console.log('Stores:')
for (const s of stores) {
  const count = await prisma.product.count({ where: { storeId: s.id } })
  console.log(`  ${s.deletedAt ? '[DELETED]' : '[ACTIVE] '} slug="${s.slug}" id=${s.id} → ${count} Product(s)`)
}

await prisma.$disconnect()
