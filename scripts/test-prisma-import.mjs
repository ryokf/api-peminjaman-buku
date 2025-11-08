import 'dotenv/config';

(async () => {
  try {
    console.log('Importing from index.js...')
    const { PrismaClient: PrismaIndex } = await import('../src/prisma/generated/prisma/index.js')
    const prismaIndex = new PrismaIndex()
    console.log('prismaIndex.book ===', typeof prismaIndex.book)
    await prismaIndex.$disconnect()
  } catch (e) {
    console.error('index.js import error:', e && e.message)
  }

  try {
    console.log('\nImporting from client.ts...')
    const { PrismaClient: PrismaTs } = await import('../src/prisma/generated/prisma/client.ts')
    const prismaTs = new PrismaTs()
    console.log('prismaTs.book ===', typeof prismaTs.book)
    await prismaTs.$disconnect()
  } catch (e) {
    console.error('client.ts import error:', e && e.message)
  }
})()
