import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const userCount = await prisma.user.count()
    console.log('Successfully connected to database!')
    console.log('Current user count:', userCount)
  } catch (error) {
    console.error('Failed to connect to database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 