import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        companyName: 'Test Company',
        role: 'Legal Counsel',
        logicScore: 7,
        charismaScore: 6,
        riskScore: 5
      }
    })
    
    // Then try to read it back
    const allUsers = await prisma.user.findMany()
    
    res.status(200).json({ 
      success: true, 
      message: 'Test user created and database queried successfully',
      createdUser: user,
      allUsers: allUsers
    })
  } catch (error) {
    console.error('Database operation error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Database operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await prisma.$disconnect()
  }
} 