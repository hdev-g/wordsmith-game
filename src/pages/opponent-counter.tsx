import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Scenario, Character } from '@/types/game';
import { PlayerData } from '@/types/player';

interface PlayerMove {
  name: string;
  description: string;
  riskScore: number;
}

interface OpponentMove {
  action: string;
  quote: string;
}

const style = `
  @keyframes borderFlow {
    0% {
      border-image-source: linear-gradient(0deg, #00BFFF, rgba(0, 191, 255, 0.3));
    }
    50% {
      border-image-source: linear-gradient(180deg, #00BFFF, rgba(0, 191, 255, 0.3));
    }
    100% {
      border-image-source: linear-gradient(360deg, #00BFFF, rgba(0, 191, 255, 0.3));
    }
  }

  @keyframes glowPulse {
    0%, 100% {
      text-shadow: 
        0 0 10px #00BFFF,
        0 0 20px #00BFFF,
        0 0 30px #00BFFF,
        0 0 40px #0099FF,
        0 0 70px #0099FF,
        0 0 80px #0099FF;
    }
    50% {
      text-shadow: 
        0 0 20px #00BFFF,
        0 0 30px #00BFFF,
        0 0 40px #00BFFF,
        0 0 50px #0099FF,
        0 0 80px #0099FF,
        0 0 90px #0099FF;
    }
  }

  @keyframes loading {
    0% { width: 0% }
    50% { width: 100% }
    100% { width: 0% }
  }

  .tron-text {
    color: #00BFFF;
    animation: glowPulse 3s ease-in-out infinite;
    position: relative;
  }

  .tron-border {
    border: 2px solid #00BFFF;
    box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
  }

  .tron-grid {
    background-image: 
      linear-gradient(rgba(0, 191, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 191, 255, 0.05) 1px, transparent 1px);
    background-size: 30px 30px;
  }
`;

export default function OpponentCounterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerMove, setPlayerMove] = useState<PlayerMove | null>(null);
  const [opponentMove, setOpponentMove] = useState<OpponentMove | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [userData, setUserData] = useState<PlayerData | null>(null);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isGeneratingFinalMoves, setIsGeneratingFinalMoves] = useState(false);

  async function generateOpponentMove(scenario: Scenario, userData: PlayerData, playerMove: PlayerMove, opponent: Character) {
    try {
      // Get the strategy level from the move name
      const strategyLevel = playerMove.name.toLowerCase().includes('low') ? 'low' :
                          playerMove.name.toLowerCase().includes('medium') ? 'medium' : 'high';

      // Debug logging
      console.log('Sending request with:', {
        scenario,
        playerStrategy: strategyLevel,
        opponent
      });

      const response = await fetch('/api/generate-opponent-counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          playerStrategy: strategyLevel,
          opponent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate opponent move');
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      // Handle the new JSON response format
      const opponentMove: OpponentMove = {
        action: result.action || 'No action provided',
        quote: result.quote || 'No quote provided'
      };
      
      setOpponentMove(opponentMove);
      
      // Store both moves for the case result page
      const battleMoves = {
        playerMove,
        opponentMove
      };
      console.log('Storing battle moves in localStorage:', battleMoves);
      localStorage.setItem('battleMoves', JSON.stringify(battleMoves));

      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate opponent\'s move. Please try again.');
      setLoading(false);
    }
  }

  async function generateFinalMoves() {
    try {
      setIsGeneratingFinalMoves(true);

      const response = await fetch('/api/generate-final-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          playerMove,
          opponentMove,
          opponent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate final moves');
      }

      const result = await response.json();
      console.log('Generated final moves:', result);
      
      // Store the final moves
      localStorage.setItem('finalMoves', JSON.stringify(result.moves));
      
      // Navigate to final move page
      router.push('/final-move');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate final moves. Please try again.');
      setIsGeneratingFinalMoves(false);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const storedUserData = localStorage.getItem('userData');
        const storedScenario = localStorage.getItem('selectedScenario');
        const storedPlayerMove = localStorage.getItem('playerMove');
        const storedOpponent = localStorage.getItem('selectedOpponent');
        
        if (!storedUserData || !storedScenario || !storedPlayerMove || !storedOpponent) {
          router.push('/');
          return;
        }

        const userData = JSON.parse(storedUserData);
        const scenario = JSON.parse(storedScenario);
        const playerMove = JSON.parse(storedPlayerMove);
        const opponent = JSON.parse(storedOpponent);
        
        // Debug logging
        console.log('Loaded data:', {
          userData,
          scenario,
          playerMove,
          opponent
        });
        
        setUserData(userData);
        setScenario(scenario);
        setPlayerMove(playerMove);
        setOpponent(opponent);

        // Generate opponent's counter-move
        await generateOpponentMove(scenario, userData, playerMove, opponent);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load game data. Please try again.');
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleRetry = async () => {
    if (!scenario || !userData || !playerMove || !opponent) return;
    
    setLoading(true);
    setRetryCount(prev => prev + 1);
    await generateOpponentMove(scenario, userData, playerMove, opponent);
  };

  const handleBackToDefense = () => {
    router.push('/battle-intro');
  };

  if (loading || isGeneratingFinalMoves) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center backdrop-blur-[2px]">
            <div className="text-4xl font-bold mb-6 uppercase tracking-wider tron-text">
              {isGeneratingFinalMoves ? 'ANALYZING STRATEGIES' : 'OPPONENT COUNTER'}
            </div>
            <div className="space-y-4">
              <div className="w-64 h-2 mx-auto bg-cyan-900/40 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 animate-[loading_2s_ease-in-out_infinite] rounded-full"></div>
              </div>
              <div className="text-cyan-300/80 font-bold uppercase tracking-wider text-sm">
                {isGeneratingFinalMoves 
                  ? 'Calculating optimal response...'
                  : `${opponent?.name} preparing counter-move`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center max-w-md mx-auto p-8 backdrop-blur-[2px] tron-border rounded-xl">
            <div className="text-2xl font-bold mb-4 uppercase tracking-wider" style={{ color: '#00BFFF' }}>
              System Error
            </div>
            <div className="mb-6" style={{ color: 'rgba(0, 191, 255, 0.8)' }}>{error}</div>
            <button
              onClick={handleRetry}
              className="px-6 py-3 tron-border rounded-lg uppercase tracking-wider font-bold"
              style={{ color: '#00BFFF', background: 'rgba(0, 10, 20, 0.9)' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!scenario || !playerMove || !opponentMove || !userData || !opponent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold text-white">Something went wrong. Please try again.</div>
      </div>
    );
  }

  return (
    <>
      <style>{style}</style>
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold uppercase tracking-wider mb-2 text-cyan-100"
                  style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                Counter Attack
              </h1>

              {/* Opponent's Counter Move */}
              <Card className="bg-black/80 backdrop-blur-sm p-6 rounded-xl border-2 border-cyan-500/50 relative mb-6 max-w-2xl mx-auto" 
                    style={{ background: 'rgba(0, 10, 20, 0.8)' }}>
                <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-[borderPulse_2s_ease-in-out_infinite]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 relative mr-4">
                      <div className="absolute inset-0 rounded-full tron-border" />
                      <img 
                        src={opponent?.image}
                        alt={opponent?.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-cyan-100 uppercase tracking-wider"
                           style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                        {opponent?.name}
                      </div>
                      <div className="text-cyan-300/80 text-sm uppercase tracking-wider">Counter Move</div>
                    </div>
                  </div>

                  {/* Action Description */}
                  <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30 mb-3">
                    <h3 className="text-cyan-300 font-bold mb-1 uppercase tracking-wider text-sm">Action</h3>
                    <p className="text-cyan-100/90 text-sm font-mono">
                      {opponentMove?.action}
                    </p>
                  </div>

                  {/* Quote */}
                  <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30">
                    <h3 className="text-cyan-300 font-bold mb-1 uppercase tracking-wider text-sm">Response</h3>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-6 h-6">
                        <img 
                          src={opponent?.image}
                          alt={opponent?.name} 
                          className="w-full h-full object-cover rounded-full border border-cyan-400/50"
                        />
                      </div>
                      <p className="text-cyan-100/90 text-sm italic font-mono">
                        "{opponentMove?.quote}"
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center">
                <button
                  onClick={generateFinalMoves}
                  className="relative group overflow-hidden px-12 py-4 bg-cyan-900/20 text-cyan-100 
                    rounded-lg border-2 border-cyan-500/50 
                    hover:bg-cyan-800/30 hover:border-cyan-400 transition-all duration-300 
                    uppercase tracking-[0.2em] font-bold text-xl
                    shadow-[0_0_20px_rgba(0,255,255,0.3)]
                    hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                  style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                >
                  <span className="relative z-10">MOVE TO END GAME</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 