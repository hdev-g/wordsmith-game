import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Character } from '@/data/characters';
import { Scenario } from '@/types/game';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PlayerMove {
  name: string;
  description: string;
  riskScore: number;
}

interface OpponentMove {
  counter: string;
}

interface FinalMove {
  description: string;
  risk: 'high' | 'low';
  probability: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      scenario,
      playerMove,
      opponentMove,
      opponent,
    } = req.body;

    // Validate required fields with specific error messages
    const missingFields = [];
    if (!scenario) missingFields.push('scenario');
    if (!playerMove) missingFields.push('playerMove');
    if (!opponentMove) missingFields.push('opponentMove');
    if (!opponent) missingFields.push('opponent');

    if (missingFields.length > 0) {
      console.error('Missing fields in request:', {
        receivedBody: req.body,
        missingFields
      });
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        receivedBody: req.body
      });
    }

    const systemMessage = `You are a legal strategy AI assistant. Generate two final defensive moves in response to this legal situation.

Case Background: ${scenario.description}

Initial Defense: ${playerMove.description}
Opponent's Counter: ${opponentMove.counter}

Generate two distinct defensive moves:
1. A high-risk, aggressive strategy
2. A low-risk, conservative strategy

For each move, provide:
- A compelling title (2-4 words)
- A brief description of the strategy (1-2 sentences)
- 2-3 pros (advantages of this approach)
- 2-3 cons (potential drawbacks)
- The risk level (high/low)
- A hidden probability of success (high risk ~40%, low risk ~75%)

The moves should be creative and specific to the case details. Consider:
- The opponent's personality and style (${opponent.name} - ${opponent.description})
- The initial defensive strategy's effectiveness
- The opponent's counter-move and its implications

Return the response in this exact JSON format:
{
  "moves": [
    {
      "title": "Aggressive strategy title",
      "description": "Brief description of the high-risk strategy",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"],
      "risk": "high",
      "probability": 40
    },
    {
      "title": "Conservative strategy title",
      "description": "Brief description of the low-risk strategy",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"],
      "risk": "low",
      "probability": 75
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: "Generate two final defensive moves for this case." }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content!);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating final moves:', error);
    return res.status(500).json({ error: 'Failed to generate final moves' });
  }
} 