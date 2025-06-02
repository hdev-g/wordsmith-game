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
    const { argument, scenario, selectedStrategy, stats } = req.body;

    // Create a system message that includes context about the case and strategy
    const systemMessage = `You are an expert legal AI assistant evaluating a lawyer's argument for their case.

The case involves: ${scenario.description}

Key Issues:
${scenario.context.keyIssues.map((issue: string) => `- ${issue}`).join('\n')}

Stakeholders:
${scenario.context.stakeholders.map((stakeholder: string) => `- ${stakeholder}`).join('\n')}

The lawyer chose the following strategy:
${scenario.riskRound.options[selectedStrategy].description}
${scenario.riskRound.options[selectedStrategy].details}

Risk Level: ${scenario.riskRound.options[selectedStrategy].risk}
Potential Reward: ${scenario.riskRound.options[selectedStrategy].reward}

Context:
- Potential Reward: ${scenario.riskRound.context.potentialReward}
- Potential Downside: ${scenario.riskRound.context.potentialDownside}
- Time Constraints: ${scenario.riskRound.context.timeConstraints}

The lawyer has the following stats:
- Logic: ${stats.logic}/10
- Charisma: ${stats.charisma}/10
- Risk Tolerance: ${stats.risk}/10

Your task is to:
1. Analyze how well their argument aligns with their chosen strategy's risk level
2. Evaluate how effectively they address the key issues and stakeholders
3. Consider how well they leverage their character's strengths (especially their risk tolerance)
4. Provide constructive feedback (2-3 paragraphs) that:
   - Highlights the strongest aspects of their argument
   - Identifies areas for improvement
   - Suggests specific ways to strengthen their case
   - Maintains an encouraging but professional tone
   - Comments on whether their argument matches the risk level of their chosen strategy`;

    // Generate feedback
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: argument }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the feedback
    const feedback = completion.choices[0].message.content;
    if (!feedback) {
      throw new Error('Failed to generate feedback');
    }

    return res.status(200).json({
      feedback
    });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return res.status(500).json({ error: 'Failed to generate feedback' });
  }
} 