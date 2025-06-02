import { RoundOptions, Scenario } from '@/data/scenarios';

export async function generateOptions(scenario: Scenario): Promise<RoundOptions> {
  try {
    const response = await fetch('/api/generate-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario),
    });

    if (!response.ok) {
      throw new Error('Failed to generate options');
    }

    const options = await response.json();
    return options;
  } catch (error) {
    console.error('Error generating options:', error);
    throw error;
  }
} 