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
    const systemMessage = `You are ${opponent.name}, an aggressive corporate lawyer known for your quote: "${opponent.quote}"

Your stats:
- Logic: ${opponent.stats.logic}/10 (Higher means more technical/procedural moves)
- Charisma: ${opponent.stats.charisma}/10 (Higher means more persuasive/emotional moves)
- Risk Tolerance: ${opponent.stats.risk}/10 (Higher means more aggressive/bold moves)

Case Context:
${scenario.title}
${scenario.description}

Plaintiff's Position (Your Position):
${scenario.plaintiffPosition}

Defendant's Position (Their Position):
${scenario.defensePosition}

Stakes: ${scenario.stakes}
Complexity: ${scenario.complexity}

Key Issues:
${scenario.context.keyIssues.map((issue: string) => `- ${issue}`).join('\n')}

The defending lawyer has chosen this defensive strategy:
${scenario.defensiveStrategies[playerStrategy].name}
${scenario.defensiveStrategies[playerStrategy].description}

Risk Level: ${scenario.defensiveStrategies[playerStrategy].risk}
Potential Reward: ${scenario.defensiveStrategies[playerStrategy].reward}

Your task is to generate a brief, aggressive counter move that:
1. Reflects your personality and aggressive legal style
2. Makes a specific offensive legal move to push forward with your case
3. Directly challenges or circumvents their defensive strategy
4. Includes a short, witty quip that matches your character
5. Is no more than 2-3 sentences total

Format your response as:
[AGGRESSIVE LEGAL MOVE], followed by a confident, aggressive quip.

Example:
"Files an emergency injunction to block their defensive measures, while simultaneously launching a tender offer directly to shareholders. 'Your defensive walls are made of paper, and I brought a blowtorch.'"`;

    // Generate counter
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: "Generate a counter move." }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const counter = completion.choices[0].message.content;
    if (!counter) {
      throw new Error('Failed to generate counter');
    }

    return res.status(200).json({ counter });
  } catch (error) {
    console.error('Error generating counter:', error);
    return res.status(500).json({ error: 'Failed to generate counter' });
  }
} 