import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Character } from '@/types/game';
import { PlayerData } from '@/types/player';
import { Scenario } from '@/types/game';

interface GameResult {
  selectedStrategy: 'high' | 'medium' | 'low';
  opponent: Character;
  opponentCounter: string;
  finalMove: string;
  finalMoveRisk: 'high' | 'low';
  successProbability: number;
}

interface CaseOutcome {
  score: number;
  outcome: 'successful defense' | 'failed defense';
  analysis: string;
  keyFactor: string;
  opponentReaction: string;
  advice: string;
}

const style = `
  @keyframes glow {
    0% { text-shadow: 0 0 20px rgba(0, 191, 255, 0.5) }
    50% { text-shadow: 0 0 30px rgba(0, 191, 255, 0.8), 0 0 50px rgba(0, 191, 255, 0.3) }
    100% { text-shadow: 0 0 20px rgba(0, 191, 255, 0.5) }
  }
  @keyframes winnerGlow {
    0% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.5) }
    50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.8), inset 0 0 40px rgba(239, 68, 68, 0.8) }
    100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.5) }
  }
  @keyframes loserGlow {
    0% { box-shadow: 0 0 20px rgba(0, 191, 255, 0.3) }
    50% { box-shadow: 0 0 40px rgba(0, 191, 255, 0.5), 0 0 60px rgba(0, 191, 255, 0.2) }
    100% { box-shadow: 0 0 20px rgba(0, 191, 255, 0.3) }
  }
  @keyframes textPulse {
    0%, 100% { transform: scale(1) }
    50% { transform: scale(1.1) }
  }
`;

export default function CaseResultPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<PlayerData | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [outcome, setOutcome] = useState<CaseOutcome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const storedCaseData = localStorage.getItem('caseData');
        const storedOutcome = localStorage.getItem('caseOutcome');
        const userId = localStorage.getItem('userId');
        
        if (!storedCaseData || !storedOutcome || !userId) {
          console.error('Missing required data:', {
            hasCaseData: !!storedCaseData,
            hasOutcome: !!storedOutcome,
            hasUserId: !!userId
          });
          router.push('/');
          return;
        }

        const caseData = JSON.parse(storedCaseData);
        const outcome = JSON.parse(storedOutcome);

        // Save to database
        try {
          const response = await fetch('/api/save-game-score', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              score: outcome.score,
              scenarioId: caseData.scenarioId,
              outcome: outcome.outcome,
              logicScore: caseData.playerStats.logic,
              charismaScore: caseData.playerStats.charisma,
              riskScore: caseData.playerStats.risk
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save score to database');
          }

          const dbResult = await response.json();
          console.log('Score saved to database:', dbResult);
        } catch (error) {
          console.error('Error saving to database:', error);
          setError('Failed to save score. Please try again.');
          setLoading(false);
          return;
        }

        setCaseData(caseData);
        setOutcome(outcome);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load case outcome. Please try again.');
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center backdrop-blur-[2px]">
            <div className="text-4xl font-bold text-cyan-400 mb-6 animate-pulse tracking-widest uppercase">
              CALCULATING VERDICT
            </div>
            <div className="space-y-4">
              <div className="w-64 h-2 mx-auto bg-cyan-900/40 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 animate-[loading_2s_ease-in-out_infinite] rounded-full"></div>
              </div>
              <div className="text-cyan-300/80 font-bold uppercase tracking-wider text-sm">
                Processing final judgment...
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
          <div className="text-center max-w-md mx-auto p-8 backdrop-blur-[2px] rounded-xl border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <div className="text-2xl font-bold text-red-500 mb-4 uppercase tracking-wider">System Error</div>
            <div className="text-red-300 mb-6">{error}</div>
            <button
              onClick={() => router.push('/final-move')}
              className="px-6 py-3 bg-red-600/20 text-red-400 rounded-lg border border-red-500/50 
                hover:bg-red-500 hover:text-white transition-all duration-300 uppercase tracking-wider font-bold"
            >
              Retry Mission
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!outcome || !caseData) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-2xl font-bold text-white">Something went wrong. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 courtroom-bg opacity-50" />
      <div className="absolute inset-0 bg-black/50 tron-grid" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-cyan-100 mb-2 tracking-widest uppercase"
                style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
              VERDICT
            </h1>
          </div>
          
          <div className="flex justify-center items-center gap-4 mb-4">
            {/* Player Avatar */}
            <div className={`text-center p-4 rounded-xl w-48 relative ${
              outcome.outcome === 'successful defense' 
                ? 'bg-emerald-400/20 border-2 border-emerald-500 animate-[winnerGlow_2s_ease-in-out_infinite]' 
                : 'bg-black/40 border-2 border-cyan-500/30'
            }`}>
              {outcome.outcome === 'successful defense' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10
                  bg-emerald-500 text-white px-3 py-1 rounded-full text-xs
                  border border-emerald-400 uppercase tracking-wider shadow-lg">
                  <span className="font-bold inline-block animate-[textPulse_2s_ease-in-out_infinite]">
                    Winner
                  </span>
                </div>
              )}
              <div className="w-24 h-24 mx-auto mb-2 relative">
                <img 
                  src="/images/player-fox-image.png"
                  alt="Player" 
                  className={`w-full h-full object-cover rounded-full border-2 ${
                    outcome.outcome === 'successful defense' 
                      ? 'border-emerald-500' 
                      : 'border-cyan-400/50'
                  }`}
                />
              </div>
              <div className={`font-bold text-lg mb-1 ${
                outcome.outcome === 'successful defense' 
                  ? 'text-emerald-400' 
                  : 'text-cyan-400'
              }`}>{caseData.playerName}</div>
              <div className={`text-base font-bold ${
                outcome.outcome === 'successful defense' 
                  ? 'text-emerald-400/90' 
                  : 'text-cyan-300/80'
              }`}>Score: {outcome.score}/100</div>
            </div>

            {/* VS Divider */}
            <div className="text-3xl font-black text-cyan-100 animate-pulse tracking-widest px-4"
                 style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
              VS
            </div>

            {/* Opponent Avatar */}
            <div className={`text-center p-4 rounded-xl w-48 relative ${
              outcome.outcome !== 'successful defense' 
                ? 'bg-red-400/20 border-2 border-red-500 animate-[winnerGlow_2s_ease-in-out_infinite]' 
                : 'bg-black/40 border-2 border-cyan-500/30'
            }`}>
              {outcome.outcome !== 'successful defense' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10
                  bg-red-500 text-white px-3 py-1 rounded-full text-xs
                  border border-red-400 uppercase tracking-wider shadow-lg">
                  <span className="font-bold inline-block animate-[textPulse_2s_ease-in-out_infinite]">
                    Winner
                  </span>
                </div>
              )}
              <div className="w-24 h-24 mx-auto mb-2 relative">
                <img 
                  src={caseData.opponent.image} 
                  alt={caseData.opponent.name} 
                  className={`w-full h-full object-cover rounded-full border-2 ${
                    outcome.outcome !== 'successful defense' 
                      ? 'border-red-500' 
                      : 'border-cyan-400/50'
                  }`}
                />
              </div>
              <div className={`font-bold text-lg mb-1 ${
                outcome.outcome !== 'successful defense' 
                  ? 'text-red-400' 
                  : 'text-cyan-400'
              }`}>{caseData.opponent.name}</div>
              <div className={`text-base ${
                outcome.outcome !== 'successful defense' 
                  ? 'text-red-400/90' 
                  : 'text-cyan-300/80'
              }`}>Opponent</div>
            </div>
          </div>

          <div className="text-center mb-3">
            <div className={`
              text-3xl font-black py-2 px-5 rounded-lg inline-block tracking-widest
              ${outcome.outcome === 'successful defense' 
                ? 'bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500 animate-[winnerGlow_2s_ease-in-out_infinite]' 
                : 'bg-red-500/10 text-red-400 border-2 border-red-500 animate-[loserGlow_2s_ease-in-out_infinite]'}
            `}>
              {outcome.outcome === 'successful defense' ? 'VICTORY!' : 'DEFEATED!'}
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border-2 border-cyan-500/30 mb-3">
            <h2 className="text-lg font-bold text-cyan-100 mb-2 uppercase tracking-wider"
                style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
              Battle Analysis
            </h2>
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30">
              <p className="text-cyan-300 mb-2 text-sm">{outcome.keyFactor}</p>
              <div className="flex items-center gap-2 text-cyan-300/80 italic border-t border-cyan-500/30 pt-2">
                <div className="w-6 h-6 flex-shrink-0">
                  <img 
                    src={caseData.opponent.image}
                    alt={caseData.opponent.name} 
                    className="w-full h-full object-cover rounded-full border border-cyan-400/50"
                  />
                </div>
                <p className="text-sm">
                  {outcome.opponentReaction}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                localStorage.removeItem('caseData');
                localStorage.removeItem('caseOutcome');
                localStorage.removeItem('userData');
                localStorage.removeItem('selectedScenario');
                localStorage.removeItem('battleMoves');
                localStorage.removeItem('selectedOpponent');
                localStorage.removeItem('finalMoves');
                router.push('/leaderboard');
              }}
              className="relative group overflow-hidden px-8 py-2 bg-cyan-500/10 text-cyan-400 
                rounded-lg border-2 border-cyan-500/50 
                hover:bg-cyan-500 hover:text-white transition-all duration-300 
                uppercase tracking-widest font-bold text-base
                shadow-[0_0_20px_rgba(0,191,255,0.3)]
                hover:shadow-[0_0_30px_rgba(0,191,255,0.5)]"
            >
              <span className="relative z-10">View Leaderboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-400 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 