import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { userId, stats } = req.body

    if (!userId || !stats) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing userId or stats' 
      })
    }

    // Update user stats in database
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        logicScore: stats.logic,
        charismaScore: stats.charisma,
        riskScore: stats.risk
      }
    })
    
    res.status(200).json({ 
      success: true, 
      message: 'User stats updated successfully',
      user
    })
  } catch (error) {
    console.error('Error updating user stats:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await prisma.$disconnect()
  }
} 