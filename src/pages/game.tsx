import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { PlayerData } from '@/types/player';
import { Character, Scenario } from '@/types/game';

interface GameState {
  stage: 'intro' | 'player-turn' | 'evaluation' | 'game-over';
  playerScore: number;
  opponentScore: number;
  round: number;
}

export default function GamePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<PlayerData | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    stage: 'intro',
    playerScore: 0,
    opponentScore: 0,
    round: 1,
  });
  const [playerArgument, setPlayerArgument] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load game data from localStorage
    const storedData = localStorage.getItem('userData');
    const storedScenario = localStorage.getItem('selectedScenario');
    const storedOpponent = localStorage.getItem('opponent');

    if (!storedData || !storedScenario || !storedOpponent) {
      router.push('/');
      return;
    }

    try {
      setUserData(JSON.parse(storedData));
      setScenario(JSON.parse(storedScenario));
      setOpponent(JSON.parse(storedOpponent));
    } catch (e) {
      console.error('Error parsing stored data:', e);
      router.push('/');
    }
  }, [router]);

  const handleSubmitArgument = async () => {
    if (!playerArgument.trim()) {
      setError('Please enter your argument');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/evaluate-argument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerArgument,
          playerStats: userData?.stats,
          scenario,
          opponent,
          round: gameState.round,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to evaluate argument');
      }

      // Update game state based on evaluation
      setGameState(prev => ({
        ...prev,
        stage: 'evaluation',
        playerScore: prev.playerScore + result.playerPoints,
        opponentScore: prev.opponentScore + result.opponentPoints,
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!userData || !scenario || !opponent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {gameState.stage === 'intro' && (
          <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl border border-amber-600/30 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Summary</h2>
            <p className="text-gray-700 mb-6">{scenario.description}</p>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Opening Statement</h3>
              <p className="text-gray-700 italic">
                "{opponent.name}: Your Honor, {opponent.openingStatement}"
              </p>
            </div>

            <button
              onClick={() => setGameState(prev => ({ ...prev, stage: 'player-turn' }))}
              className="w-full bg-amber-700 text-white py-3 px-6 rounded-lg hover:bg-amber-800 transition-colors duration-200 font-semibold"
            >
              Begin Your Argument
            </button>
          </Card>
        )}

        {gameState.stage === 'player-turn' && (
          <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl border border-amber-600/30">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Turn</h2>
              <p className="text-gray-700">Present your argument to the court.</p>
            </div>

            <textarea
              value={playerArgument}
              onChange={(e) => setPlayerArgument(e.target.value)}
              className="w-full h-40 p-4 mb-4 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
              placeholder="Type your legal argument here..."
            />

            {error && (
              <p className="text-red-500 mb-4">{error}</p>
            )}

            <button
              onClick={handleSubmitArgument}
              disabled={loading}
              className="w-full bg-amber-700 text-white py-3 px-6 rounded-lg hover:bg-amber-800 transition-colors duration-200 font-semibold disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : 'Submit Argument'}
            </button>
          </Card>
        )}

        {/* Score display */}
        <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-amber-600/30">
          <div className="text-center">
            <p className="text-sm text-gray-600">Round {gameState.round}</p>
            <div className="flex gap-4 mt-2">
              <div>
                <p className="text-sm text-gray-600">You</p>
                <p className="text-xl font-bold text-amber-700">{gameState.playerScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{opponent.name}</p>
                <p className="text-xl font-bold text-blue-700">{gameState.opponentScore}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 