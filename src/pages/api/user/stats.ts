import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { Score } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Check user stats
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Get user base info
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            scores: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Calculate stats from scores
        const stats = {
          totalGames: user.scores.length,
          averageScore: user.scores.length > 0 
            ? user.scores.reduce((acc, curr) => acc + curr.score, 0) / user.scores.length 
            : 0,
          successRate: user.scores.length > 0
            ? (user.scores.filter(s => s.outcome === 'successful defense').length / user.scores.length) * 100
            : 0,
          highestScore: user.scores.length > 0
            ? Math.max(...user.scores.map(s => s.score))
            : 0,
          currentStats: {
            logicScore: user.logicScore,
            charismaScore: user.charismaScore,
            riskScore: user.riskScore
          },
          recentScores: user.scores.slice(0, 5).map(s => ({
            score: s.score,
            date: s.createdAt,
            outcome: s.outcome
          }))
        };

        return res.status(200).json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            companyName: user.companyName,
            role: user.role,
          },
          stats
        });

      case 'PUT':
        // Update user stats
        const { 
          userId: updateUserId, 
          logicScore,
          charismaScore,
          riskScore
        } = req.body;

        if (!updateUserId || typeof logicScore !== 'number' || typeof charismaScore !== 'number' || typeof riskScore !== 'number') {
          return res.status(400).json({ error: 'Invalid update data' });
        }

        const updatedUser = await prisma.user.update({
          where: { id: updateUserId },
          data: {
            logicScore,
            charismaScore,
            riskScore
          }
        });

        return res.status(200).json({
          user: updatedUser
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in user stats handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 