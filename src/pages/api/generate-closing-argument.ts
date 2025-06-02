import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

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
    const { prompt, scenario, charismaScore, logicResult, riskResult } = req.body;

    // Parse round results
    const logic = JSON.parse(logicResult);
    const risk = JSON.parse(riskResult);

    // Create a system message that includes context about the case and previous rounds
    const systemMessage = `You are an expert legal AI assistant helping a lawyer craft their closing argument.
The case involves: ${scenario.description}

Previous round performance:
- Logic Round: ${logic.playerScore > logic.opponentScore ? 'Won' : 'Lost'} (Score: ${logic.playerScore})
- Risk Round: ${risk.playerScore > risk.opponentScore ? 'Won' : 'Lost'} (Score: ${risk.playerScore})

Your task is to:
1. Generate a compelling closing argument (max 250 words) based on the user's prompt
2. Score the quality of their prompt (1-100) based on:
   - Clarity of direction
   - Strategic thinking
   - Understanding of key issues
   - Consideration of audience
3. Provide brief feedback on the prompt's effectiveness

The lawyer has a Charisma score of ${charismaScore}/10, which should influence the emotional impact.`;

    // Generate the closing argument
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the response and parse it
    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('Failed to generate response');
    }

    // Calculate base score (1-100)
    const baseScore = Math.min(100, Math.max(1, 
      50 + // Base score
      (charismaScore * 3) + // Charisma bonus (max 30)
      (Math.random() * 20) // Random factor (0-20)
    ));

    // Generate feedback based on the prompt quality
    const feedback = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are a legal expert providing brief, constructive feedback on a closing argument prompt. Keep your response to 2-3 sentences."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    return res.status(200).json({
      argument: response,
      score: Math.round(baseScore),
      feedback: feedback.choices[0].message.content || "No feedback available"
    });
  } catch (error) {
    console.error('Error generating closing argument:', error);
    return res.status(500).json({ error: 'Failed to generate closing argument' });
  }
} 