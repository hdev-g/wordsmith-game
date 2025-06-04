import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Scenario } from '@/types/game';
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

  .strategy-card {
    transition: all 0.3s ease-in-out;
  }

  .strategy-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 30px rgba(0, 191, 255, 0.3);
  }

  .strategy-card.selected {
    border-color: #00BFFF;
    box-shadow: 0 0 30px rgba(0, 191, 255, 0.5);
    transform: translateY(-5px);
  }
`;

interface Strategy {
  name: string;
  description: string[];
  risk: number;
  reward: string;
}

export default function SelectStrategyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'low' | 'medium' | 'high' | null>(null);
  const [showStrategies, setShowStrategies] = useState(false);

  useEffect(() => {
    const storedScenario = localStorage.getItem('selectedScenario');
    if (!storedScenario) {
      router.push('/');
      return;
    }
    setScenario(JSON.parse(storedScenario));
    setLoading(false);
  }, [router]);

  const handleStrategySelect = (strategyType: 'low' | 'medium' | 'high') => {
    setSelectedStrategy(strategyType);
  };

  const handleProceed = () => {
    if (!selectedStrategy || !scenario) return;
    
    // Store the complete strategy object
    const selectedStrategyData = scenario.defensiveStrategies[selectedStrategy];
    localStorage.setItem('playerMove', JSON.stringify(selectedStrategyData));
    router.push('/opponent-counter');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 loading-container">
          <div className="loading-content backdrop-blur-[2px]">
            <div className="loading-text tron-text text-2xl">
              LOADING CASE FILES...
            </div>
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
            {!showStrategies ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-bold uppercase tracking-wider mb-2 text-cyan-100"
                      style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                    Case Details
                  </h1>
                </div>

                <Card className="bg-black/80 backdrop-blur-sm p-6 rounded-xl border-2 border-cyan-500/50 relative mb-8 max-w-2xl mx-auto" style={{ background: 'rgba(0, 10, 20, 0.8)' }}>
                  <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-[borderPulse_2s_ease-in-out_infinite]" />
                  <div className="relative z-10">
                    <div className="flex flex-col items-center mb-4">
                      <h2 className="text-3xl font-bold text-cyan-100 text-center uppercase tracking-wider"
                          style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                        {scenario?.title}
                      </h2>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-sm uppercase tracking-wider text-cyan-300 border-2 border-cyan-500/50"
                              style={{ 
                                background: 'rgba(0, 10, 20, 0.9)',
                                textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
                              }}>
                          {scenario?.complexity}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm uppercase tracking-wider text-cyan-300 border-2 border-cyan-500/50"
                              style={{ 
                                background: 'rgba(0, 10, 20, 0.9)',
                                textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
                              }}>
                          Stakes: {scenario?.stakes}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-cyan-100/90 text-center text-base font-mono leading-relaxed">
                        {scenario?.description}
                      </div>

                      <div className="flex flex-col gap-4 mt-4">
                        <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30">
                          <h3 className="text-cyan-300 font-bold mb-1 uppercase tracking-wider">Plaintiff Position</h3>
                          <p className="text-cyan-100/80 text-sm">{scenario?.plaintiffPosition}</p>
                        </div>
                        <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30">
                          <h3 className="text-cyan-300 font-bold mb-1 uppercase tracking-wider">Defense Position</h3>
                          <p className="text-cyan-100/80 text-sm">{scenario?.defensePosition}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-center">
                  <button
                    onClick={() => setShowStrategies(true)}
                    className="relative group overflow-hidden px-12 py-4 bg-cyan-900/20 text-cyan-100 
                      rounded-lg border-2 border-cyan-500/50 
                      hover:bg-cyan-800/30 hover:border-cyan-400 transition-all duration-300 
                      uppercase tracking-[0.2em] font-bold text-xl
                      shadow-[0_0_20px_rgba(0,255,255,0.3)]
                      hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                    style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                  >
                    <span className="relative z-10">Choose Your Strategy</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-bold uppercase tracking-wider mb-4 text-cyan-100"
                      style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                    Select Your Strategy
                  </h1>
                  <p className="text-xl text-cyan-300/80">
                    Choose your defensive approach carefully. Each strategy offers unique advantages and risks.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
                  {scenario && ['low', 'medium', 'high'].map((strategyType) => {
                    const strategy = scenario.defensiveStrategies[strategyType as keyof typeof scenario.defensiveStrategies];
                    return (
                      <button
                        key={strategy.name}
                        onClick={() => handleStrategySelect(strategyType as 'low' | 'medium' | 'high')}
                        className={`strategy-card text-center p-6 rounded-xl border-2 transition-all duration-300 h-full flex flex-col ${
                          selectedStrategy === strategyType
                            ? 'border-cyan-400 bg-cyan-900/30'
                            : 'border-cyan-500/50 bg-black/80'
                        }`}
                      >
                        <h3 className="text-xl font-bold mb-2 text-cyan-100">{strategy.name}</h3>
                        <div className="text-cyan-300/80 mb-6 text-sm">
                          <p className="mb-2">Risk Level: {strategy.risk}</p>
                        </div>
                        
                        <div className="flex-grow flex flex-col items-center justify-center mb-6">
                          <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-cyan-900/20 border border-cyan-500/30">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                              <span className="text-cyan-400 font-bold">•</span>
                            </div>
                            <p className="text-cyan-100/90 text-sm leading-tight">
                              {strategy.description[0]}
                            </p>
                          </div>
                        </div>

                        <div className="text-cyan-300/80 text-sm mt-auto">
                          <p>Potential Reward: {strategy.reward}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-center">
                  {selectedStrategy && (
                    <button
                      onClick={handleProceed}
                      className="relative group overflow-hidden px-10 py-3 bg-cyan-500/10 text-cyan-400 
                        rounded-lg border-2 border-cyan-500/50 
                        hover:bg-cyan-500 hover:text-white transition-all duration-300 
                        uppercase tracking-widest font-bold text-lg
                        shadow-[0_0_20px_rgba(0,191,255,0.3)]
                        hover:shadow-[0_0_30px_rgba(0,191,255,0.5)]"
                    >
                      <span className="relative z-10">Proceed with Strategy</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-400 opacity-0 
                        group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 