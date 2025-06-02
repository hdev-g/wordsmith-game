import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';

interface RoundResult {
  playerScore: number;
  opponentScore: number;
  option: 'best' | 'middle' | 'worst';
}

export default function BattleResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<RoundResult | null>(null);
  const [isLogicRound, setIsLogicRound] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResult = localStorage.getItem('lastRoundResult');
    const currentRound = localStorage.getItem('currentRound');
    
    if (!storedResult || !currentRound) {
      router.push('/');
      return;
    }
    
    setResult(JSON.parse(storedResult));
    setIsLogicRound(currentRound === 'logic');
    setLoading(false);
  }, [router]);

  const getResultSummary = (option: 'best' | 'middle' | 'worst') => {
    if (isLogicRound) {
      switch (option) {
        case 'best':
          return "Your strategic approach demonstrated excellent legal reasoning.";
        case 'middle':
          return "Your conventional approach was sound but left room for improvement.";
        case 'worst':
          return "Your risky strategy may have undermined your position.";
      }
    } else {
      switch (option) {
        case 'best':
          return "Your bold strategy paid off with exceptional results.";
        case 'middle':
          return "Your measured approach balanced risk and reward effectively.";
        case 'worst':
          return "You played it safe, limiting both risk and potential reward.";
      }
    }
  };

  const handleContinue = () => {
    if (isLogicRound) {
      // Store the logic round result
      const logicResult = localStorage.getItem('lastRoundResult');
      if (logicResult) {
        localStorage.setItem('logicRoundResult', logicResult);
      }
      
      // Set up for risk round
      localStorage.setItem('currentRound', 'risk');
      router.push('/risk-round');
    } else {
      // Store the risk round result
      const riskResult = localStorage.getItem('lastRoundResult');
      if (riskResult) {
        localStorage.setItem('riskRoundResult', riskResult);
      }
      
      // Set up for charisma round
      localStorage.setItem('currentRound', 'charisma');
      router.push('/charisma-round');
    }
  };

  if (loading || !result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  const playerWon = result.playerScore > result.opponentScore;
  const scoreDiff = Math.abs(result.playerScore - result.opponentScore);
  const isDecisive = scoreDiff > 20;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {isLogicRound ? 'Logic Round' : 'Risk Round'} Result
          </h1>
          <p className={`text-2xl font-bold ${playerWon ? 'text-green-400' : 'text-red-400'} mb-4`}>
            {playerWon 
              ? isDecisive ? "Decisive Victory!" : "Victory!"
              : isDecisive ? "Major Setback" : "Minor Setback"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Player Card */}
          <Card className={`p-6 bg-white/60 backdrop-blur-sm shadow-2xl rounded-xl border transition-all
            ${playerWon ? 'border-green-500' : 'border-amber-600/30'}`}>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4 border-4 border-amber-700">
                <span className="text-4xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You</h2>
              <div className="mt-4">
                <p className="text-3xl font-bold text-amber-800">{result.playerScore}</p>
                <p className="text-sm text-gray-600">points</p>
              </div>
            </div>
          </Card>

          {/* Opponent Card */}
          <Card className={`p-6 bg-white/60 backdrop-blur-sm shadow-2xl rounded-xl border transition-all
            ${!playerWon ? 'border-green-500' : 'border-amber-600/30'}`}>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4 border-4 border-amber-700">
                <span className="text-4xl">⚖️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Opponent</h2>
              <div className="mt-4">
                <p className="text-3xl font-bold text-amber-800">{result.opponentScore}</p>
                <p className="text-sm text-gray-600">points</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center mb-8">
          <Card className="p-6 bg-white/60 backdrop-blur-sm">
            <p className="text-lg text-gray-800">{getResultSummary(result.option)}</p>
            <p className="text-gray-600 mt-2">
              {playerWon
                ? `You outscored your opponent by ${scoreDiff} points`
                : `Your opponent outscored you by ${scoreDiff} points`}
            </p>
          </Card>
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-lg font-semibold"
          >
            {isLogicRound ? 'Continue to Risk Round' : 'Continue to Closing Arguments'}
          </button>
        </div>
      </div>
    </div>
  );
} 