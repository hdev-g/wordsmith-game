import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`, // Make email unique
        name: 'Test User',
        logicScore: 7,
        charismaScore: 6,
        riskScore: 5,
      },
    });

    // Create a test score for the user
    const testScore = await prisma.score.create({
      data: {
        userId: testUser.id,
        scenarioId: 1,
        score: 85,
        outcome: 'successful defense',
        logicScore: testUser.logicScore,
        charismaScore: testUser.charismaScore,
        riskScore: testUser.riskScore,
      },
    });

    // Fetch the user with their scores to verify the relation
    const userWithScores = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: { scores: true },
    });

    res.status(200).json({
      message: 'Database connection and operations successful',
      testUser: userWithScores,
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await prisma.$disconnect();
  }
} 