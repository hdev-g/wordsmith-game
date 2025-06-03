import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    if (!userId || !scenarioId || score === undefined || !outcome) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate score range
    if (score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    // Validate outcome
    if (!['successful defense', 'failed defense'].includes(outcome)) {
      return res.status(400).json({ error: 'Invalid outcome value' });
    }

    // Save the score
    const savedScore = await prisma.score.create({
      data: {
        userId,
        scenarioId,
        score,
        outcome,
        logicScore,
        charismaScore,
        riskScore
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json(savedScore);
  } catch (error) {
    console.error('Error saving score:', error);
    return res.status(500).json({ error: 'Failed to save score' });
  }
} 