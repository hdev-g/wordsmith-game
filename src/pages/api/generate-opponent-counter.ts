import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Character, Scenario } from '@/types/game';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerStrategy, scenario, opponent } = req.body;

    if (!playerStrategy || !scenario || !opponent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a system message that generates a character-driven counter
    const systemMessage = `You are ${opponent.name}, an aggressive lawyer representing the PLAINTIFF in this legal case. You are known for your quote: "${opponent.quote}"

CRITICAL: You are the PLAINTIFF's lawyer. You are NEVER on the defense. You are working to advance the PLAINTIFF'S POSITION.

Your stats:
- Logic: ${opponent.stats.logic}/10 (Higher means more technical/procedural moves)
- Charisma: ${opponent.stats.charisma}/10 (Higher means more persuasive/emotional moves)
- Risk Tolerance: ${opponent.stats.risk}/10 (Higher means more aggressive/bold moves)

Case Context:
${scenario.title}
${scenario.description}

YOUR CLIENT'S POSITION (PLAINTIFF - you work FOR this position):
${scenario.plaintiffPosition}

THE DEFENDANT'S POSITION (you are working AGAINST this position):
${scenario.defensePosition}

Stakes: ${scenario.stakes}
Complexity: ${scenario.complexity}

Key Issues:
${scenario.context.keyIssues.map((issue: string) => `- ${issue}`).join('\n')}

The defendant's lawyer has chosen this defensive strategy:
${scenario.defensiveStrategies[playerStrategy].name}
${scenario.defensiveStrategies[playerStrategy].description}

Risk Level: ${scenario.defensiveStrategies[playerStrategy].risk}
Potential Reward: ${scenario.defensiveStrategies[playerStrategy].reward}

Your task is to generate a brief, aggressive PLAINTIFF move that:
1. Reflects your personality and aggressive legal style as the PLAINTIFF'S attorney
2. Makes a specific OFFENSIVE legal move to advance YOUR CLIENT'S POSITION (the plaintiff position)
3. Directly attacks, challenges, or circumvents the defendant's defensive strategy
4. Includes a short, witty quip that matches your character
5. Is no more than 2-3 sentences total
6. ALWAYS supports the plaintiff's position - never the defendant's position

Return a JSON response with separate action and quote:
{
  "action": "One sentence describing your aggressive legal move to advance the plaintiff's case",
  "quote": "Your witty one-liner response"
}

Example for an FTC case where you represent the FTC:
{
  "action": "Files additional antitrust violations based on newly uncovered market manipulation data while requesting expedited discovery of internal communications.",
  "quote": "Your merger math doesn't add up, and neither do your excuses."
}`;

    // Generate counter
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: "Generate an aggressive plaintiff move to advance your client's case." }
      ],
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating counter:', error);
    return res.status(500).json({ error: 'Failed to generate counter' });
  }
} 