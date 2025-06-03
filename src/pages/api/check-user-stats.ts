import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing userId' 
      })
    }

    // Get user with their stats from database
    const user = await prisma.user.findUnique({
      where: { id: userId as string }
    })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({ 
      success: true, 
      message: 'User stats retrieved successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        stats: {
          logic: user.logicScore,
          charisma: user.charismaScore,
          risk: user.riskScore
        }
      }
    })
  } catch (error) {
    console.error('Error retrieving user stats:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve user stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await prisma.$disconnect()
  }
} 