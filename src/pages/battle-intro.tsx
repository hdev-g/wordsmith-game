import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Character } from '@/types/game';
import { PlayerData } from '@/types/player';

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

  .tron-text {
    color: #00BFFF;
    animation: glowPulse 3s ease-in-out infinite;
    position: relative;
  }

  .tron-text::before {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    filter: blur(15px);
    opacity: 0.8;
    animation: glowPulse 3s ease-in-out infinite;
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

  .stat-bar {
    width: 100%;
    height: 12px;
    background: rgba(0, 10, 20, 0.6);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  }

  .stat-bar-fill {
    height: 100%;
    transition: width 0.3s ease-in-out;
    border-radius: 6px;
    position: relative;
  }

  .stat-bar-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(0, 191, 255, 0.5),
      rgba(0, 191, 255, 1)
    );
    box-shadow: 
      0 0 10px rgba(0, 191, 255, 0.5),
      0 0 20px rgba(0, 191, 255, 0.3);
  }
`;

export default function BattleIntroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<PlayerData | null>(null);
  const [opponent, setOpponent] = useState<Character | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const storedUserData = localStorage.getItem('userData');
        const storedOpponent = localStorage.getItem('selectedOpponent');
        
        if (!storedUserData || !storedOpponent) {
          console.error('Missing required data:', {
            hasUserData: !!storedUserData,
            hasOpponent: !!storedOpponent,
          });
          router.push('/');
          return;
        }

        // Debug logging for raw data
        console.log('Raw opponent data from localStorage:', storedOpponent);
        
        const userData = JSON.parse(storedUserData);
        const opponent = JSON.parse(storedOpponent);
        
        // Debug logging for parsed data
        console.log('Parsed opponent data:', {
          id: opponent.id,
          name: opponent.name,
          pseudonym: opponent.pseudonym,
          stats: opponent.stats
        });
        
        setUserData(userData);
        setOpponent(opponent);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load battle data. Please try again.');
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleStartBattle = () => {
    if (!opponent || !userData) return;
    router.push('/select-strategy');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 loading-container">
          <div className="loading-content backdrop-blur-[2px]">
            <div className="loading-text tron-text text-2xl">
              INITIALIZING BATTLE
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
              onClick={() => router.push('/select-scenario')}
              className="px-6 py-3 tron-border rounded-lg uppercase tracking-wider font-bold"
              style={{ color: '#00BFFF', background: 'rgba(0, 10, 20, 0.9)' }}
            >
              Return to Selection
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

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 
                className="text-6xl font-bold uppercase tracking-wider mb-4 text-cyan-100"
                style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
              >
                Meet Your Opponent
              </h1>
              <p className="text-xl text-cyan-300/80 uppercase tracking-wider">
                Prepare for the Legal Battle
              </p>
            </div>

            <div className="flex justify-center items-center gap-12 mb-12">
              {/* Player Avatar */}
              <div className="text-center">
                <div className="w-40 h-40 mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full tron-border" />
                  <img 
                    src="/images/player-fox-image.png"
                    alt="Player" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="text-cyan-100 font-bold text-xl mb-2 uppercase tracking-wider"
                     style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                  {userData?.name}
                </div>
                <div className="text-cyan-300/80 text-lg mb-4 uppercase tracking-wider font-mono">Legal Prodigy</div>
                
                {/* Player Stats */}
                <Card className="bg-black/80 backdrop-blur-sm p-4 w-48 border-2 border-cyan-500/50 relative" style={{ background: 'rgba(0, 10, 20, 0.8)' }}>
                  <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-[borderPulse_2s_ease-in-out_infinite]" />
                  <div className="space-y-3 relative z-10">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-100/90 uppercase tracking-wider font-mono">Logic</span>
                        <div className="flex items-center">
                          <span className="text-cyan-300 font-bold font-mono">{userData?.stats.logic}</span>
                          <span className="text-cyan-400/50 ml-1 font-mono">/10</span>
                        </div>
                      </div>
                      <div className="stat-bar">
                        <div 
                          className="stat-bar-fill"
                          style={{ width: `${(userData?.stats.logic || 0) * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-100/90 uppercase tracking-wider font-mono">Charisma</span>
                        <div className="flex items-center">
                          <span className="text-cyan-300 font-bold font-mono">{userData?.stats.charisma}</span>
                          <span className="text-cyan-400/50 ml-1 font-mono">/10</span>
                        </div>
                      </div>
                      <div className="stat-bar">
                        <div 
                          className="stat-bar-fill"
                          style={{ width: `${(userData?.stats.charisma || 0) * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-100/90 uppercase tracking-wider font-mono">Risk</span>
                        <div className="flex items-center">
                          <span className="text-cyan-300 font-bold font-mono">{userData?.stats.risk}</span>
                          <span className="text-cyan-400/50 ml-1 font-mono">/10</span>
                        </div>
                      </div>
                      <div className="stat-bar">
                        <div 
                          className="stat-bar-fill"
                          style={{ width: `${(userData?.stats.risk || 0) * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* VS Text */}
              <div className="text-6xl font-black text-cyan-400 animate-[vsGlow_2s_ease-in-out_infinite] tracking-widest"
                   style={{ textShadow: '0 0 20px #00ffff, 0 0 30px #00ffff' }}>
                VS
              </div>

              {/* Opponent Avatar */}
              <div className="text-center">
                {opponent ? (
                  <>
                    <div className="w-40 h-40 mx-auto mb-4 relative">
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-[borderPulse_2s_ease-in-out_infinite]" />
                      <img 
                        src={opponent.image}
                        alt={opponent.name} 
                        className="w-full h-full object-cover rounded-full border-4 border-cyan-500/50"
                        style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
                      />
                    </div>
                    <div className="text-cyan-100 font-bold text-xl mb-2 uppercase tracking-wider"
                         style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                      {opponent.name}
                    </div>
                    <div className="text-cyan-300/80 text-lg mb-4 uppercase tracking-wider font-mono">
                      {opponent.pseudonym}
                    </div>
                    
                    {/* Opponent Stats */}
                    <Card className="bg-black/80 backdrop-blur-sm p-4 w-48 border-2 border-cyan-500/50 relative" style={{ background: 'rgba(0, 10, 20, 0.8)' }}>
                      <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-[borderPulse_2s_ease-in-out_infinite]" />
                      <div className="space-y-3 relative z-10">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-cyan-100/90 uppercase tracking-wider font-mono">Logic</span>
                            <div className="flex items-center">
                              <span className="text-cyan-300 font-bold font-mono">{opponent.stats.logic}</span>
                              <span className="text-cyan-400/50 ml-1 font-mono">/10</span>
                            </div>
                          </div>
                          <div className="stat-bar">
                            <div 
                              className="stat-bar-fill"
                              style={{ width: `${opponent.stats.logic * 10}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-cyan-100/90 uppercase tracking-wider font-mono">Charisma</span>
                            <div className="flex items-center">
                              <span className="text-cyan-300 font-bold font-mono">{opponent.stats.charisma}</span>
                              <span className="text-cyan-400/50 ml-1 font-mono">/10</span>
                            </div>
                          </div>
                          <div className="stat-bar">
                            <div 
                              className="stat-bar-fill"
                              style={{ width: `${opponent.stats.charisma * 10}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-cyan-100/90 uppercase tracking-wider font-mono">Risk</span>
                            <div className="flex items-center">
                              <span className="text-cyan-300 font-bold font-mono">{opponent.stats.risk}</span>
                              <span className="text-cyan-400/50 ml-1 font-mono">/10</span>
                            </div>
                          </div>
                          <div className="stat-bar">
                            <div 
                              className="stat-bar-fill"
                              style={{ width: `${opponent.stats.risk * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </>
                ) : (
                  <div className="text-cyan-300/80 text-lg">Loading opponent data...</div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStartBattle}
                className="relative group overflow-hidden px-16 py-6 bg-cyan-900/20 text-cyan-100 
                  rounded-lg border-2 border-cyan-500/50 
                  hover:bg-cyan-800/30 hover:border-cyan-400 transition-all duration-300 
                  uppercase tracking-[0.2em] font-bold text-2xl
                  shadow-[0_0_20px_rgba(0,255,255,0.3)]
                  hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
              >
                <span className="relative z-10">Proceed to Case</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 