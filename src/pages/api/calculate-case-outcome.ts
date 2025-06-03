import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Character } from '@/types/game';
import { Scenario } from '@/types/game';
import { PlayerStats } from '@/types/player';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RequestBody {
  playerStats: PlayerStats;
  playerName: string;
  scenario: Scenario;
  selectedStrategy: 'high' | 'medium' | 'low';
  opponent: Character;
  opponentCounter: string;
  finalMove: {
    description: string;
    risk: 'high' | 'low';
    probability: number;
  };
  powerUpPoints: number;
}

function calculateBaseScore(playerStats: PlayerStats, opponent: Character, finalMoveRisk: 'high' | 'low'): number {
  let score = 0;
  let scoreBreakdown = {
    logicScore: 0,
    charismaScore: 0,
    riskScore: 0
  };
  
  console.log('\n' + '-'.repeat(80));
  console.log('\x1b[36m%s\x1b[0m', '                         LOGIC SCORE CALCULATION');
  console.log('-'.repeat(80));
  
  // Logic comparison (max 35 points)
  const logicDiff = playerStats.logic - opponent.stats.logic;
  scoreBreakdown.logicScore = 25 + Math.min(Math.max(logicDiff * 2, -15), 10);
  score += scoreBreakdown.logicScore;
  
  console.log('\x1b[33m%s\x1b[0m', `Player Logic: ${playerStats.logic} vs Opponent Logic: ${opponent.stats.logic}`);
  console.log('\x1b[33m%s\x1b[0m', `Logic Difference: ${logicDiff}`);
  console.log('\x1b[32m%s\x1b[0m', `Base Logic Score: 25`);
  console.log('\x1b[32m%s\x1b[0m', `Logic Adjustment: ${Math.min(Math.max(logicDiff * 2, -15), 10)}`);
  console.log('\x1b[36m%s\x1b[0m', `Final Logic Score: ${scoreBreakdown.logicScore}`);
  
  console.log('\n' + '-'.repeat(80));
  console.log('\x1b[36m%s\x1b[0m', '                         CHARISMA SCORE CALCULATION');
  console.log('-'.repeat(80));
  
  // Charisma comparison (max 35 points)
  const charismaDiff = playerStats.charisma - opponent.stats.charisma;
  scoreBreakdown.charismaScore = 25 + Math.min(Math.max(charismaDiff * 2, -15), 10);
  score += scoreBreakdown.charismaScore;
  
  console.log('\x1b[33m%s\x1b[0m', `Player Charisma: ${playerStats.charisma} vs Opponent Charisma: ${opponent.stats.charisma}`);
  console.log('\x1b[33m%s\x1b[0m', `Charisma Difference: ${charismaDiff}`);
  console.log('\x1b[32m%s\x1b[0m', `Base Charisma Score: 25`);
  console.log('\x1b[32m%s\x1b[0m', `Charisma Adjustment: ${Math.min(Math.max(charismaDiff * 2, -15), 10)}`);
  console.log('\x1b[36m%s\x1b[0m', `Final Charisma Score: ${scoreBreakdown.charismaScore}`);
  
  console.log('\n' + '-'.repeat(80));
  console.log('\x1b[36m%s\x1b[0m', '                         RISK STRATEGY CALCULATION');
  console.log('-'.repeat(80));
  
  // Risk alignment (max 30 points)
  const opponentIsAggressive = opponent.stats.risk >= 7;
  
  console.log('\x1b[33m%s\x1b[0m', `Opponent Risk Level: ${opponent.stats.risk}/10 (${opponentIsAggressive ? 'Aggressive' : 'Conservative'})`);
  console.log('\x1b[33m%s\x1b[0m', `Player's Final Move Risk Level: ${finalMoveRisk}`);
  
  // Base 10 points for any defensive move
  scoreBreakdown.riskScore = 10;
  console.log('\x1b[32m%s\x1b[0m', `Base Risk Score: ${scoreBreakdown.riskScore}`);
  
  // Risk strategy effectiveness
  let riskAdjustment = 0;
  if (opponentIsAggressive) {
    if (finalMoveRisk === 'high') {
      riskAdjustment = 20;
      console.log('\x1b[32m%s\x1b[0m', 'High risk against aggressive opponent: +20 (potentially very effective)');
    } else {
      riskAdjustment = -5;
      console.log('\x1b[31m%s\x1b[0m', 'Low risk against aggressive opponent: -5 (can be dangerous)');
    }
  } else {
    if (finalMoveRisk === 'low') {
      riskAdjustment = 15;
      console.log('\x1b[32m%s\x1b[0m', 'Low risk against conservative opponent: +15 (solid strategy)');
    } else {
      riskAdjustment = 5;
      console.log('\x1b[33m%s\x1b[0m', 'High risk against conservative opponent: +5 (might be overkill)');
    }
  }
  
  scoreBreakdown.riskScore += riskAdjustment;
  score += riskAdjustment;
  
  console.log('\x1b[36m%s\x1b[0m', `Risk Score Adjustment: ${riskAdjustment}`);
  console.log('\x1b[36m%s\x1b[0m', `Final Risk Score: ${scoreBreakdown.riskScore}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('\x1b[35m%s\x1b[0m', '                         FINAL SCORE BREAKDOWN');
  console.log('='.repeat(80));
  console.log('\x1b[36m%s\x1b[0m', `Logic Component: ${scoreBreakdown.logicScore}/35`);
  console.log('\x1b[36m%s\x1b[0m', `Charisma Component: ${scoreBreakdown.charismaScore}/35`);
  console.log('\x1b[36m%s\x1b[0m', `Risk Strategy Component: ${scoreBreakdown.riskScore}/30`);
  console.log('\x1b[33m%s\x1b[0m', `Total Raw Score: ${score}`);
  const finalScore = Math.min(Math.max(score, 0), 100);
  console.log('\x1b[32m%s\x1b[0m', `Final Adjusted Score: ${finalScore}/100`);
  console.log('='.repeat(80));

  return finalScore;
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
      playerStats,
      playerName,
      scenario,
      selectedStrategy,
      opponent,
      opponentCounter,
      finalMove,
      powerUpPoints,
    } = req.body as RequestBody;

    console.log('\n' + '='.repeat(80));
    console.log('\x1b[36m%s\x1b[0m', '                         CASE OUTCOME CALCULATION');
    console.log('='.repeat(80));
    console.log('\x1b[33m%s\x1b[0m', 'Player:', playerName);
    console.log('\x1b[33m%s\x1b[0m', 'Player Stats:', JSON.stringify(playerStats, null, 2));
    console.log('\x1b[31m%s\x1b[0m', 'Opponent:', opponent.name);
    console.log('\x1b[31m%s\x1b[0m', 'Opponent Stats:', JSON.stringify(opponent.stats, null, 2));
    console.log('\x1b[32m%s\x1b[0m', 'Selected Strategy:', selectedStrategy);
    console.log('\x1b[32m%s\x1b[0m', 'Final Move Risk Level:', finalMove.risk);
    console.log('\x1b[32m%s\x1b[0m', 'Final Move Success Probability:', finalMove.probability);
    console.log('\x1b[32m%s\x1b[0m', 'Power-Up Points:', powerUpPoints);
    console.log('='.repeat(80));

    // Calculate base score from stats comparison
    const baseScore = calculateBaseScore(playerStats, opponent, finalMove.risk);
    
    console.log('\n' + '-'.repeat(80));
    console.log('\x1b[36m%s\x1b[0m', '                         PROBABILITY IMPACT CALCULATION');
    console.log('-'.repeat(80));
    
    // Implement scaled probability impact (70% base + up to 30% from probability)
    const probabilityFactor = 0.7 + (finalMove.probability / 100 * 0.3);
    const probabilityReduction = ((1 - probabilityFactor) * 100).toFixed(1);
    let adjustedScore = Math.round(baseScore * probabilityFactor);
    
    console.log('\x1b[33m%s\x1b[0m', `Move Success Probability: ${finalMove.probability}%`);
    console.log('\x1b[32m%s\x1b[0m', `Base Score Protection: 70%`);
    console.log('\x1b[32m%s\x1b[0m', `Probability Contribution: ${(finalMove.probability * 0.3).toFixed(1)}%`);
    console.log('\x1b[31m%s\x1b[0m', `Final Score Reduction: ${probabilityReduction}%`);
    console.log('\x1b[36m%s\x1b[0m', `Score Before Probability: ${baseScore}`);
    console.log('\x1b[36m%s\x1b[0m', `Score After Probability: ${adjustedScore}`);

    console.log('\n' + '-'.repeat(80));
    console.log('\x1b[36m%s\x1b[0m', '                         WORDSMITH POWER-UP CALCULATION');
    console.log('-'.repeat(80));
    
    // Calculate Wordsmith power-up bonus
    const powerUpMultiplier = 1 + (powerUpPoints / 100); // Each point adds 1% to multiplier
    const powerUpBonus = Math.round(powerUpPoints * 1.5); // Direct bonus is 1.5x the points
    const scoreBeforeWordsmith = adjustedScore;
    
    console.log('\x1b[33m%s\x1b[0m', `Power-Up Points Accumulated: ${powerUpPoints}/15`);
    console.log('\x1b[32m%s\x1b[0m', `Base Multiplier Effect: ${((powerUpMultiplier - 1) * 100).toFixed(1)}% boost`);
    console.log('\x1b[32m%s\x1b[0m', `Direct Bonus Points: ${powerUpBonus} (${powerUpPoints} × 1.5)`);
    
    // Apply power-up effects
    adjustedScore = Math.round((adjustedScore * powerUpMultiplier) + powerUpBonus);
    const wordsmithGain = adjustedScore - scoreBeforeWordsmith;
    
    console.log('\x1b[36m%s\x1b[0m', `Score Before Wordsmith: ${scoreBeforeWordsmith}`);
    console.log('\x1b[36m%s\x1b[0m', `Total Wordsmith Gain: +${wordsmithGain} points`);
    
    // Ensure final score is between 0 and 100
    adjustedScore = Math.min(Math.max(adjustedScore, 0), 100);
    
    console.log('\n' + '*'.repeat(80));
    console.log('\x1b[35m%s\x1b[0m', '                         FINAL SCORE SUMMARY');
    console.log('*'.repeat(80));
    console.log('\x1b[36m%s\x1b[0m', `Initial Base Score: ${baseScore}`);
    console.log('\x1b[36m%s\x1b[0m', `After Probability (×${probabilityFactor.toFixed(2)}): ${Math.round(baseScore * probabilityFactor)}`);
    console.log('\x1b[36m%s\x1b[0m', `After Wordsmith Power-Up: ${adjustedScore}`);
    console.log('\x1b[32m%s\x1b[0m', `Final Score: ${adjustedScore}/100`);
    console.log('*'.repeat(80) + '\n');

    // Generate a narrative analysis using GPT-4
    const systemMessage = `You are a legal analysis AI. Analyze this defensive case outcome and generate a brief analysis explaining the result.

Case: ${scenario.description}

Defender (${playerName}):
- Logic: ${playerStats.logic}/10
- Charisma: ${playerStats.charisma}/10
- Risk: ${playerStats.risk}/10
- Initial Defense: ${scenario.defensiveStrategies[selectedStrategy].description}
- Final Defensive Move: ${finalMove.description}
- Power-Up Bonus: +${powerUpPoints} points

Aggressor (${opponent.name}):
- Logic: ${opponent.stats.logic}/10
- Charisma: ${opponent.stats.charisma}/10
- Risk: ${opponent.stats.risk}/10
- Aggressive Move: ${opponentCounter}
- Character Quote: "${opponent.quote}"
- Opening Statement: "${opponent.openingStatement}"

Final Score: ${adjustedScore}/100
Outcome: ${adjustedScore >= 60 ? 'Successfully Defended' : 'Takeover Succeeded'}

Generate a JSON response in this format that MATCHES the final score and outcome:
{
  "analysis": "2-3 sentences explaining why the defense ${adjustedScore >= 60 ? 'succeeded' : 'failed'} with a score of ${adjustedScore}. If power-up points were significant (${powerUpPoints} > 0), mention how the Wordsmith power-up influenced the outcome.",
  "keyFactor": "A comprehensive one-sentence analysis of the most critical factor that determined the ${adjustedScore >= 60 ? 'successful defense' : 'failed defense'}, incorporating specific details about the player's stats, strategy choices, and their effectiveness against ${opponent.name}'s approach",
  "opponentReaction": "A witty, character-specific one-liner from ${opponent.name}",
  "advice": "One sentence of advice for future defensive cases based on this ${adjustedScore >= 60 ? 'successful' : 'failed'} defense"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: "Generate the case analysis that matches the score and outcome." }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content!);

    return res.status(200).json({
      score: adjustedScore,
      outcome: adjustedScore >= 60 ? 'successful defense' : 'failed defense',
      analysis: analysis.analysis,
      keyFactor: analysis.keyFactor,
      opponentReaction: analysis.opponentReaction,
      advice: analysis.advice
    });
  } catch (error) {
    console.error('Error calculating case outcome:', error);
    return res.status(500).json({ error: 'Failed to calculate case outcome' });
  }
} 