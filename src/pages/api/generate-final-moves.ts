import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Character, Scenario } from '@/types/game';
import { PlayerStats } from '@/types/player';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RequestBody {
  playerStats: PlayerStats;
  scenario: Scenario;
  selectedStrategy: 'high' | 'medium' | 'low';
  opponent: Character;
  opponentCounter: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerStats, scenario, selectedStrategy, opponent, opponentCounter } = req.body as RequestBody;

    if (!playerStats || !scenario || !selectedStrategy || !opponent || !opponentCounter) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a system message that generates two final defensive moves
    const systemMessage = `You are a legal strategy AI assistant. Given the following case scenario and game state, generate two distinct final defensive moves for the player who is DEFENDING against a hostile takeover:

Case: ${scenario.description}

Player's Role: DEFENDING against hostile takeover
Player's Stats:
- Logic: ${playerStats.logic}/10
- Charisma: ${playerStats.charisma}/10
- Risk: ${playerStats.risk}/10

Game State:
1. Player's Initial Defensive Strategy: ${scenario.riskRound.options[selectedStrategy].description}
2. Opponent's Aggressive Move (${opponent.name}): ${opponentCounter}

Generate two defensive options:
1. A high-risk, high-reward defensive move (e.g., poison pill, scorched earth, crown jewel defense)
2. A lower-risk, more conservative defensive move (e.g., white knight, pac-man defense, legal injunction)

For each option, provide:
- A specific defensive legal action or argument (2-3 sentences)
- Success probability (a number between 1-100)
- Potential impact if successful

Format each option in the following exact JSON format:
{
  "highRiskOption": {
    "description": "The specific defensive move description for high risk option",
    "risk": "high",
    "probability": 50,
    "potentialImpact": "brief impact description"
  },
  "lowRiskOption": {
    "description": "The specific defensive move description for low risk option",
    "risk": "low",
    "probability": 75,
    "potentialImpact": "brief impact description"
  }
}

Requirements for each option:
- description: A specific defensive legal action that directly counters the takeover attempt
- risk: Must be exactly "high" for highRiskOption and "low" for lowRiskOption
- probability: A number between 1-100 (high risk should have lower probability)
- potentialImpact: A brief description of how this move would protect the company if successful`;

    // Generate options
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: "Generate the two final defensive moves." }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('Failed to generate options');
    }

    const parsedResponse = JSON.parse(response);
    
    // Ensure both options are properly formatted
    const highRiskOption = {
      description: parsedResponse.highRiskOption?.description || '',
      risk: 'high' as const,
      probability: parsedResponse.highRiskOption?.probability || 50,
      potentialImpact: parsedResponse.highRiskOption?.potentialImpact || ''
    };

    const lowRiskOption = {
      description: parsedResponse.lowRiskOption?.description || '',
      risk: 'low' as const,
      probability: parsedResponse.lowRiskOption?.probability || 50,
      potentialImpact: parsedResponse.lowRiskOption?.potentialImpact || ''
    };
    
    return res.status(200).json({
      options: [highRiskOption, lowRiskOption]
    });
  } catch (error) {
    console.error('Error generating final moves:', error);
    return res.status(500).json({ error: 'Failed to generate final moves' });
  }
} 