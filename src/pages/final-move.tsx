import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Character } from '@/types/game';
import { Scenario } from '@/types/game';
import { PlayerData } from '@/types/player';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlayerMove {
  name: string;
  description: string;
  riskScore: number;
}

interface OpponentMove {
  action: string;
  quote: string;
}

interface FinalMove {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  risk: 'high' | 'low';
  probability: number;
}

// Track power-up points - max 15 points allocated over 1 second
const MAX_POWER_UP_POINTS = 15;
const POWER_UP_DURATION = 1000; // 1 second in milliseconds
const PROGRESS_INTERVAL = 30; // Update every 30ms
const POINTS_PER_INTERVAL = (MAX_POWER_UP_POINTS / POWER_UP_DURATION) * PROGRESS_INTERVAL;

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

  @keyframes powerUpGlow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.5);
    }
    50% { 
      box-shadow: 0 0 40px rgba(0, 255, 255, 0.8), inset 0 0 40px rgba(0, 255, 255, 0.8);
    }
  }
  @keyframes powerUpPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  @keyframes readyGlow {
    0%, 100% { text-shadow: 0 0 10px rgba(0, 255, 255, 0.5); }
    50% { text-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.4); }
  }
`;

export default function FinalMovePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalMoves, setFinalMoves] = useState<FinalMove[]>([]);
  const [playerMove, setPlayerMove] = useState<PlayerMove | null>(null);
  const [opponentMove, setOpponentMove] = useState<OpponentMove | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [userData, setUserData] = useState<PlayerData | null>(null);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [calculatingOutcome, setCalculatingOutcome] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [powerUpProgress, setPowerUpProgress] = useState(0);
  const [isPowerUpActive, setIsPowerUpActive] = useState(false);
  const [powerUpInterval, setPowerUpInterval] = useState<NodeJS.Timeout | null>(null);
  const [powerUpPoints, setPowerUpPoints] = useState(0);
  const [selectedMove, setSelectedMove] = useState<FinalMove | null>(null);
  const [hasShaken, setHasShaken] = useState(false);
  const [powerUpStartTime, setPowerUpStartTime] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('Loading data from localStorage...');
        const storedUserData = localStorage.getItem('userData');
        const storedScenario = localStorage.getItem('selectedScenario');
        const storedBattleMoves = localStorage.getItem('battleMoves');
        const storedOpponent = localStorage.getItem('selectedOpponent');
        const storedFinalMoves = localStorage.getItem('finalMoves');
        
        if (!storedUserData || !storedScenario || !storedBattleMoves || !storedOpponent || !storedFinalMoves) {
          console.error('Missing required data:', {
            hasUserData: !!storedUserData,
            hasScenario: !!storedScenario,
            hasBattleMoves: !!storedBattleMoves,
            hasOpponent: !!storedOpponent,
            hasFinalMoves: !!storedFinalMoves
          });
          router.push('/');
          return;
        }

        const userData = JSON.parse(storedUserData);
        const scenario = JSON.parse(storedScenario);
        const { playerMove, opponentMove } = JSON.parse(storedBattleMoves);
        const opponent = JSON.parse(storedOpponent);
        const finalMoves = JSON.parse(storedFinalMoves);
        
        console.log('Loaded data:', {
          userData,
          scenario,
          playerMove,
          opponentMove,
          opponent,
          finalMoves
        });

        setUserData(userData);
        setScenario(scenario);
        setPlayerMove(playerMove);
        setOpponentMove(opponentMove);
        setOpponent(opponent);
        setFinalMoves(finalMoves);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load game data. Please try again.');
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleRetry = () => {
    router.push('/opponent-counter');
  };

  const handleMoveSelect = (move: FinalMove) => {
    setSelectedMove(move);
    // Trigger shake animation
    setHasShaken(false);
    setTimeout(() => setHasShaken(true), 50);
  };

  const startPowerUp = () => {
    console.log('Starting power-up', { selectedMove, powerUpStartTime });
    if (!selectedMove) return; // Only allow power-up if move is selected
    
    setIsPowerUpActive(true);
    const startTime = Date.now();
    setPowerUpStartTime(startTime);
    
    console.log('Setting up power-up interval');
    const interval = setInterval(() => {
      const totalElapsedTime = Date.now() - startTime;
      // Calculate the time within the current cycle (0-3000ms)
      const elapsedInCycle = totalElapsedTime % POWER_UP_DURATION;
      console.log('Power-up interval tick', { totalElapsedTime, elapsedInCycle });
      
      // Calculate progress and points based on time within current cycle
      const progress = (elapsedInCycle / POWER_UP_DURATION) * 100;
      const points = Math.min(
        Math.floor((elapsedInCycle / POWER_UP_DURATION) * MAX_POWER_UP_POINTS),
        MAX_POWER_UP_POINTS
      );
      
      console.log('Updating power-up progress', { progress, points });
      setPowerUpProgress(progress);
      setPowerUpPoints(points);
    }, PROGRESS_INTERVAL);
    
    setPowerUpInterval(interval);
  };

  const stopPowerUp = () => {
    console.log('Stopping power-up', { powerUpPoints, powerUpInterval });
    setIsPowerUpActive(false);
    if (powerUpInterval) {
      clearInterval(powerUpInterval);
      setPowerUpInterval(null);
    }
    setPowerUpStartTime(null);
    
    // If we have points, proceed with the case outcome
    if (powerUpPoints > 0) {
      console.log('Proceeding with case outcome', { selectedMove, powerUpPoints });
      handleSelectMove(selectedMove!);
    }
  };

  const handleSelectMove = async (move: FinalMove) => {
    try {
      setLoading(true);
      setCalculatingOutcome(true);
      
      // Get userId from userData
      if (!userData?.id) {
        throw new Error('User ID not found');
      }
      
      // Prepare the data for case outcome calculation
      const caseData = {
        playerStats: userData.stats,
        playerName: userData.name,
        scenario,
        selectedStrategy: playerMove?.name.toLowerCase().includes('low') ? 'low' :
                        playerMove?.name.toLowerCase().includes('medium') ? 'medium' : 'high',
        opponent,
        opponentCounter: `${opponentMove?.action} ${opponentMove?.quote}`,
        finalMove: move,
        powerUpPoints,
        userId: userData.id,
        scenarioId: scenario?.id || 1
      };
      
      console.log('Calculating case outcome with data:', caseData);

      // Calculate the case outcome
      const response = await fetch('/api/calculate-case-outcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to calculate case outcome');
      }

      const outcome = await response.json();
      console.log('Case outcome:', outcome);

      // Store both the case data and outcome for the result page
      localStorage.setItem('caseData', JSON.stringify(caseData));
      localStorage.setItem('caseOutcome', JSON.stringify(outcome));
      localStorage.setItem('userId', userData.id); // Store userId separately

      // Navigate to the result page
      router.push('/case-result');
    } catch (error) {
      console.error('Error calculating case outcome:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate case outcome');
      setLoading(false);
      setCalculatingOutcome(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center backdrop-blur-[2px]">
            <div className="text-4xl font-bold mb-6 uppercase tracking-wider tron-text">
              {calculatingOutcome ? 'CALCULATING VERDICT' : 'LOADING FINAL MOVES'}
            </div>
            <div className="space-y-4">
              <div className="w-64 h-2 mx-auto bg-cyan-900/40 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 animate-[loading_2s_ease-in-out_infinite] rounded-full"></div>
              </div>
              <div className="text-cyan-300/80 font-bold uppercase tracking-wider text-sm">
                {calculatingOutcome 
                  ? 'Processing final arguments...'
                  : 'Analyzing strategic options...'}
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
                Final Move
              </h1>
              <p className="text-lg text-cyan-300/80 mb-4">Select your finishing strategy</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {finalMoves.map((move, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoveSelect(move)}
                    className={`text-left p-4 rounded-xl backdrop-blur-sm transition-all duration-300
                      ${selectedMove === move 
                        ? 'bg-cyan-900/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.3)]' 
                        : 'bg-black/80 border-2 border-cyan-500/50 hover:bg-cyan-900/20 hover:scale-[1.02] hover:-translate-y-1'
                      } group`}
                  >
                    <div className="mb-3">
                      <h3 className="text-2xl font-bold text-cyan-100 uppercase tracking-wider mb-1"
                          style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                        {move.title}
                      </h3>
                      <p className="text-cyan-300/80 text-sm">
                        {move.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {move.pros.slice(0, 1).map((pro, i) => (
                        <div key={i} className="bg-cyan-900/20 p-2 rounded-lg border border-cyan-500/30">
                          <div className="flex items-start">
                            <span className="text-cyan-400 mr-2 text-base font-bold">+</span>
                            <span className="text-cyan-100/90 text-sm">{pro}</span>
                          </div>
                        </div>
                      ))}
                      {move.cons.slice(0, 1).map((con, i) => (
                        <div key={i} className="bg-cyan-900/20 p-2 rounded-lg border border-cyan-500/30">
                          <div className="flex items-start">
                            <span className="text-cyan-400 mr-2 text-base font-bold">-</span>
                            <span className="text-cyan-100/90 text-sm">{con}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Power Up Section */}
              <div className={`mt-4 flex flex-col items-center transition-opacity duration-300
                ${selectedMove ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div 
                  className={`relative w-24 h-24 mb-2 cursor-pointer transition-all duration-200 
                    ${selectedMove && !hasShaken ? 'animate-[shake_0.5s_ease-in-out]' : ''}
                    ${selectedMove ? 'hover:scale-105' : ''}`}
                  onMouseDown={startPowerUp}
                  onMouseUp={stopPowerUp}
                  onMouseLeave={stopPowerUp}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startPowerUp();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    stopPowerUp();
                  }}
                >
                  <img 
                    src="/images/Company Logo (1).png"
                    alt="Wordsmith Power"
                    className={`w-full h-full object-contain ${isPowerUpActive ? 'animate-[powerUpPulse_1s_ease-in-out_infinite]' : ''}`}
                    style={{
                      filter: isPowerUpActive ? 'brightness(1.5) drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))' : 'none',
                    }}
                  />
                  {(isPowerUpActive || selectedMove) && (
                    <div 
                      className={`absolute inset-0 rounded-full ${
                        isPowerUpActive 
                          ? 'animate-[powerUpGlow_1s_ease-in-out_infinite]'
                          : selectedMove ? 'animate-[readyGlow_2s_ease-in-out_infinite]' : ''
                      }`}
                      style={{ border: '2px solid rgba(0, 255, 255, 0.5)' }}
                    />
                  )}
                </div>
                
                <div className={`text-cyan-300/80 uppercase tracking-wider text-xs mb-1 transition-all duration-300 ${
                  selectedMove ? 'animate-[readyGlow_2s_ease-in-out_infinite]' : ''
                }`}>
                  Hold to Deploy Wordsmith
                </div>

                <div className="text-cyan-400 font-bold text-sm mb-2">
                  Power-Up Points: {powerUpPoints}/{MAX_POWER_UP_POINTS}
                </div>

                <div className="w-48 h-2 bg-cyan-900/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-100 ease-linear rounded-full"
                    style={{ 
                      width: `${powerUpProgress}%`,
                      boxShadow: isPowerUpActive ? '0 0 20px rgba(0, 255, 255, 0.8)' : 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 