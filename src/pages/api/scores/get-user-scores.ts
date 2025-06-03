import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { Score } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, limit = '10', offset = '0' } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    // Get user's scores
    const scores = await prisma.score.findMany({
      where: {
        userId: userId as string
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        user: {
          select: {
            name: true,
            email: true,
            companyName: true,
            role: true,
            logicScore: true,
            charismaScore: true,
            riskScore: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalScores = await prisma.score.count({
      where: {
        userId: userId as string
      }
    });

    // Calculate user statistics
    const stats = {
      totalGames: totalScores,
      averageScore: scores.reduce((acc: number, curr: Score) => acc + curr.score, 0) / scores.length || 0,
      successRate: (scores.filter((s: Score) => s.outcome === 'successful defense').length / scores.length) * 100 || 0,
      highestScore: Math.max(...scores.map((s: Score) => s.score), 0),
      recentScores: scores.slice(0, 5).map((s: Score) => ({
        score: s.score,
        date: s.createdAt,
        outcome: s.outcome
      }))
    };

    return res.status(200).json({
      scores,
      stats,
      pagination: {
        total: totalScores,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error retrieving scores:', error);
    return res.status(500).json({ error: 'Failed to retrieve scores' });
  }
} 