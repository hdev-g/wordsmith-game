import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Count all users
    const userCount = await prisma.user.count()
    console.log(`Database connection successful! Found ${userCount} users.`)
    
    // Get the most recent score
    const latestScore = await prisma.score.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
    
    if (latestScore) {
      console.log('Most recent score:', {
        userName: latestScore.user.name,
        score: latestScore.score,
        outcome: latestScore.outcome,
        playedAt: latestScore.createdAt
      })
    }
  } catch (error) {
    console.error('Database connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 