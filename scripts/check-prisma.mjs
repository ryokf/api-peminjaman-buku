import '../src/prisma/client.js'
import { prisma } from '../src/prisma/client.js'

console.log('prisma.book ===', typeof prisma.book)
await prisma.$disconnect()
