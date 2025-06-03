import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { RoundOptions, Scenario } from '@/types/game';

// Add debug logging for environment variable
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
console.log('API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 7));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Add organization if you have one
  // organization: process.env.OPENAI_ORG_ID,
});

// Cache object to store generated options
const optionsCache: Record<string, {
  options: RoundOptions;
  timestamp: number;
}> = {};

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scenario: Scenario = req.body;

    // Check cache first
    const cachedData = optionsCache[scenario.id];
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Using cached options for scenario:', scenario.id);
      return res.status(200).json(cachedData.options);
    }

    // Verify API key before making request
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const prompt = `
As an expert legal advisor, generate three different strategic approaches (best, middle, and worst) for the following legal scenario. Each approach should be realistic but clearly differentiated in terms of effectiveness.

SCENARIO CONTEXT:
Domain: ${scenario.context.legalDomain}
Key Issues: ${scenario.context.keyIssues.join(', ')}
Stakeholders: ${scenario.context.stakeholders.join(', ')}
Constraints: ${scenario.context.constraints.join(', ')}

CURRENT SITUATION:
${scenario.description}

SPECIFIC PROMPT:
${scenario.logicRound.prompt}

Please provide:
1. Best approach - A strategic, well-reasoned solution that addresses core issues and demonstrates deep understanding of ${scenario.context.legalDomain}
2. Middle approach - A conventional but incomplete solution that partially addresses the situation
3. Worst approach - A problematic solution that could worsen the situation or create new legal risks

For each approach, include:
- The specific action to take (be detailed and concrete)
- A brief explanation of why this approach is effective/ineffective
- Consider the impact on key stakeholders: ${scenario.context.stakeholders.join(', ')}
- Account for constraints: ${scenario.context.constraints.join(', ')}

Format as JSON with the following structure:
{
  "best": { "text": "action", "explanation": "why" },
  "middle": { "text": "action", "explanation": "why" },
  "worst": { "text": "action", "explanation": "why" }
}`;

    console.log('Generating new options for scenario:', scenario.id);
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const options = JSON.parse(response) as RoundOptions;
      
      // Cache the new options
      optionsCache[scenario.id] = {
        options,
        timestamp: now
      };

      return res.status(200).json(options);
    } catch (openaiError: any) {
      console.error('OpenAI API Error:', {
        error: openaiError,
        message: openaiError.message,
        type: openaiError.type,
        status: openaiError.status,
      });
      return res.status(500).json({ 
        error: 'OpenAI API error',
        details: openaiError.message,
        type: openaiError.type
      });
    }
  } catch (error) {
    console.error('Error generating options:', error);
    return res.status(500).json({ error: 'Failed to generate options' });
  }
} 