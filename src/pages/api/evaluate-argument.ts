import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Character, Scenario } from '@/types/game';
import { PlayerStats } from '@/types/player';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EvaluationRequest {
  playerArgument: string;
  playerStats: PlayerStats;
  scenario: Scenario;
  opponent: Character;
  round: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerArgument, playerStats, scenario, opponent, round } = req.body as EvaluationRequest;

    if (!playerArgument || !playerStats || !scenario || !opponent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Construct the prompt for OpenAI
    const prompt = `You are judging a legal battle game. Evaluate the following legal argument based on the context:

Scenario: ${scenario.title}
${scenario.description}

Player's Stats:
- Logic: ${playerStats.logic}/10 (Analytical thinking and reasoning)
- Charisma: ${playerStats.charisma}/10 (Persuasiveness and presentation)
- Risk: ${playerStats.risk}/10 (Bold strategies and unconventional approaches)

Player's Argument:
${playerArgument}

Evaluate the argument based on:
1. Relevance to the case (25 points)
2. Legal reasoning and logic (25 points)
3. Persuasiveness and presentation (25 points)
4. Strategic risk-taking and creativity (25 points)

Consider the player's stats when evaluating their performance in each category.
Provide a score out of 100 and a brief explanation of the ruling, highlighting how well they utilized their strongest stats.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content || '';
    
    // Extract score from the response (assuming the AI includes a numerical score)
    const scoreMatch = response.match(/(\d+)\s*(?:points|\/100)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50; // Default to 50 if no score found

    // Calculate opponent's score based on their stats
    const opponentScore = calculateOpponentScore(opponent);

    return res.status(200).json({
      evaluation: response,
      playerPoints: score,
      opponentPoints: opponentScore,
    });

  } catch (error) {
    console.error('Error evaluating argument:', error);
    return res.status(500).json({ error: 'Failed to evaluate argument' });
  }
}

function calculateOpponentScore(opponent: Character): number {
  // Calculate base score from all stats
  const baseScore = Object.values(opponent.stats).reduce((sum, stat) => sum + stat, 0);
  
  // Normalize to 100-point scale and add some randomness
  const normalizedScore = (baseScore / 30) * 100; // 30 is max possible (10 per stat)
  const randomFactor = Math.random() * 20 - 10; // Random adjustment between -10 and +10
  
  return Math.min(100, Math.max(0, Math.round(normalizedScore + randomFactor)));
} 