import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      userId,
      scenarioId,
      score,
      outcome,
      logicScore,
      charismaScore,
      riskScore
    } = req.body;

    // Validate required fields
    if (!userId || score === undefined || !outcome || !logicScore || !charismaScore || !riskScore) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['userId', 'score', 'outcome', 'logicScore', 'charismaScore', 'riskScore'],
        received: {
          userId,
          score,
          outcome,
          logicScore,
          charismaScore,
          riskScore
        }
      });
    }

    // Validate score range
    if (score < 0 || score > 100) {
      return res.status(400).json({ message: 'Score must be between 0 and 100' });
    }

    // Validate outcome values
    if (!['successful defense', 'failed defense'].includes(outcome)) {
      return res.status(400).json({ message: 'Invalid outcome value' });
    }

    // Save the score
    const savedScore = await prisma.score.create({
      data: {
        userId,
        scenarioId: scenarioId || 1, // Default to 1 if not provided
        score,
        outcome,
        logicScore,
        charismaScore,
        riskScore
      },
      include: {
        user: true
      }
    });

    // Update user's stats
    await prisma.user.update({
      where: { id: userId },
      data: {
        logicScore,
        charismaScore,
        riskScore
      }
    });

    res.status(200).json({
      message: 'Score saved successfully',
      score: savedScore
    });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({
      message: 'Failed to save score',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 