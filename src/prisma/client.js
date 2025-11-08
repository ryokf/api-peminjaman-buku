import { PrismaClient } from './generated/prisma/index.js'

// Single shared Prisma client for the app
export const prisma = new PrismaClient()

// Optionally disconnect on process exit in development
if (process.env.NODE_ENV !== 'production') {
  process.once('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}
