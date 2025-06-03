import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get top 10 scores with only player name
    const topScores = await prisma.score.findMany({
      take: 10,
      orderBy: {
        score: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Leaderboard retrieved successfully',
      scores: topScores
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      message: 'Failed to fetch leaderboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 