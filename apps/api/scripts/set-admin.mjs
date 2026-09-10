import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const user = await prisma.user.update({
  where: { email: 'alex.roventa94@gmail.com' },
  data: { role: 'admin' },
  select: { email: true, role: true },
})

console.log('Updated:', user)
await prisma.$disconnect()
