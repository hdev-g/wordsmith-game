import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { scenarios } from '@/data/scenarios';
import { Character, Scenario } from '@/types/game';
import { PlayerData } from '@/types/player';

interface GameResult {
  argument: string;
  feedback: string;
  selectedStrategy: 'high' | 'medium' | 'low';
  opponent: Character;
  opponentCounter?: string;
  finalMove?: string;
  ruling?: string;
  success?: boolean;
  successProbability?: number;
}

export default function GameCompletePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<PlayerData | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalMoveText, setFinalMoveText] = useState('');
  const [showFinalMove, setShowFinalMove] = useState(false);
  const [submittingFinalMove, setSubmittingFinalMove] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        const storedScenario = localStorage.getItem('selectedScenario');
        const storedResult = localStorage.getItem('gameResult');

        if (!storedUserData || !storedScenario || !storedResult) {
          router.push('/');
          return;
        }

        const userData = JSON.parse(storedUserData);
        const scenario = JSON.parse(storedScenario);
        const result = JSON.parse(storedResult);

        setUserData(userData);
        setScenario(scenario);
        setResult(result);

        // If we don't have an opponent counter yet, generate one
        if (!result.opponentCounter) {
          try {
            const response = await fetch('/api/generate-opponent-counter', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                playerArgument: result.argument,
                scenario,
                selectedStrategy: result.selectedStrategy,
                opponent: result.opponent
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to generate opponent counter');
            }

            const { counter } = await response.json();
            const updatedResult = { ...result, opponentCounter: counter };
            localStorage.setItem('gameResult', JSON.stringify(updatedResult));
            setResult(updatedResult);
          } catch (error) {
            console.error('Error generating opponent counter:', error);
            setError('Failed to generate opponent counter. Please try again.');
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load game data. Please try again.');
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleSubmitFinalMove = async () => {
    if (!userData || !scenario || !result || !finalMoveText.trim()) return;

    setSubmittingFinalMove(true);
    setError('');

    try {
      const response = await fetch('/api/generate-final-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerArgument: result.argument,
          opponentCounter: result.opponentCounter,
          finalMove: finalMoveText,
          scenario,
          selectedStrategy: result.selectedStrategy,
          stats: userData.stats,
          opponent: result.opponent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit final move');
      }

      const { ruling, success, successProbability } = await response.json();
      
      // Update the game result
      const updatedResult = {
        ...result,
        finalMove: finalMoveText,
        ruling,
        success,
        successProbability
      };
      
      localStorage.setItem('gameResult', JSON.stringify(updatedResult));
      
      // Navigate to the results page
      router.push('/case-result');
    } catch (error) {
      console.error('Error submitting final move:', error);
      setError('Failed to submit final move. Please try again.');
    } finally {
      setSubmittingFinalMove(false);
    }
  };

  if (loading || !userData || !scenario || !result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold text-white">
          {error || "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{scenario.title}</h1>
          <p className="text-xl text-gray-200 mb-4">{scenario.description}</p>
        </div>

        {/* Initial Argument */}
        <Card className="p-6 bg-white/60 backdrop-blur-sm shadow-2xl rounded-xl border border-amber-600/30 mb-8">
          <h2 className="text-xl font-bold text-amber-800 mb-4">Your Initial Argument</h2>
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{result.argument}</p>
          </div>
        </Card>

        {/* Opponent Counter */}
        {result.opponentCounter && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm shadow-2xl rounded-xl border border-red-600/30 mb-8">
            <h2 className="text-xl font-bold text-red-800 mb-4">{result.opponent.name}'s Counter</h2>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{result.opponentCounter}</p>
            </div>
            {!result.finalMove && !showFinalMove && (
              <button
                onClick={() => setShowFinalMove(true)}
                className="mt-4 w-full bg-amber-700 text-white py-3 px-6 rounded-lg hover:bg-amber-800 transition-colors duration-200 font-semibold"
              >
                Make Your Final Move
              </button>
            )}
          </Card>
        )}

        {/* Final Move Input */}
        {showFinalMove && !result.finalMove && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm shadow-2xl rounded-xl border border-amber-600/30 mb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-4">Your Final Move</h2>
            <p className="text-gray-700 mb-4">
              This is your chance to counter their arguments and close your case. Make it count!
            </p>
            <textarea
              value={finalMoveText}
              onChange={(e) => setFinalMoveText(e.target.value)}
              placeholder="Present your final argument..."
              className="w-full h-64 p-4 rounded-lg border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-white/90 mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitFinalMove}
                disabled={submittingFinalMove || !finalMoveText.trim()}
                className={`px-6 py-2 bg-amber-700 text-white rounded-lg 
                  ${submittingFinalMove || !finalMoveText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-800'}`}
              >
                {submittingFinalMove ? 'Submitting...' : 'Submit Final Move'}
              </button>
            </div>
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </Card>
        )}

        {/* Final Move Display */}
        {result.finalMove && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm shadow-2xl rounded-xl border border-amber-600/30 mb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-4">Your Final Move</h2>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{result.finalMove}</p>
            </div>
          </Card>
        )}

        {/* Ruling Card */}
        {result.ruling && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm shadow-2xl rounded-xl border border-purple-600/30 mb-8">
            <h2 className="text-xl font-bold text-purple-800 mb-4">The Ruling</h2>
            <div className="bg-white/50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{result.ruling}</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.success ? 'Victory!' : 'Defeat'}
              </div>
              <p className="text-gray-600">
                Success Probability: {result.successProbability}%
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              // Clear game state
              localStorage.removeItem('gameResult');
              localStorage.removeItem('currentRound');
              localStorage.removeItem('selectedScenario');
              router.push('/select-scenario');
            }}
            className="px-8 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-lg font-semibold"
          >
            Try Another Case
          </button>
          <button
            onClick={() => {
              // Clear all state and return to start
              localStorage.clear();
              router.push('/');
            }}
            className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-lg font-semibold"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
} 