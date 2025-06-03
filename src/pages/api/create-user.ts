import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, companyName, role } = req.body

    // Create user with default scores
    const user = await prisma.user.create({
      data: {
        email,
        name,
        companyName,
        role,
        logicScore: 5,    // Default starting score
        charismaScore: 5, // Default starting score
        riskScore: 5      // Default starting score
      }
    })
    
    res.status(200).json({ 
      success: true, 
      message: 'User created successfully',
      user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 