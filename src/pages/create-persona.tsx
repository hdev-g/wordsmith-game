import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PlayerData, PlayerStats } from "@/types/player";
import { scenarios } from "@/data/scenarios";
import { characters } from "@/data/characters";
import { Card } from '@/components/ui/card';

const MAX_POINTS = 24;
const MIN_STAT = 1;
const MAX_STAT = 10;

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

export default function CreatePersonaPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<PlayerData | null>(null);
  const [stats, setStats] = useState<PlayerStats>({
    logic: 8,
    charisma: 8,
    risk: 8,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (!storedData) {
      router.push('/');
      return;
    }
    setUserData(JSON.parse(storedData));
  }, [router]);

  const remainingPoints = MAX_POINTS - Object.values(stats).reduce((a, b) => a + b, 0);

  const handleStatChange = (stat: keyof PlayerStats, value: number) => {
    const newValue = Math.max(MIN_STAT, Math.min(MAX_STAT, value));
    const otherStatsTotal = Object.entries(stats)
      .filter(([key]) => key !== stat)
      .reduce((sum, [, val]) => sum + val, 0);

    if (otherStatsTotal + newValue > MAX_POINTS) {
      setError('Maximum power allocation exceeded');
      return;
    }

    setError('');
    setStats(prev => ({
      ...prev,
      [stat]: newValue
    }));
  };

  const handleSubmit = () => {
    if (remainingPoints < 0) {
      setError('Power allocation exceeds system limits');
      return;
    }

    if (!userData) return;

    // Get a random scenario from the scenarios array
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    // Get a random opponent from the characters array
    const randomOpponent = characters[Math.floor(Math.random() * characters.length)];

    // Ensure descriptions are arrays for the scenario
    const scenarioWithArrays = {
      ...randomScenario,
      defensiveStrategies: {
        low: {
          ...randomScenario.defensiveStrategies.low,
          description: Array.isArray(randomScenario.defensiveStrategies.low.description) 
            ? randomScenario.defensiveStrategies.low.description 
            : [randomScenario.defensiveStrategies.low.description]
        },
        medium: {
          ...randomScenario.defensiveStrategies.medium,
          description: Array.isArray(randomScenario.defensiveStrategies.medium.description)
            ? randomScenario.defensiveStrategies.medium.description
            : [randomScenario.defensiveStrategies.medium.description]
        },
        high: {
          ...randomScenario.defensiveStrategies.high,
          description: Array.isArray(randomScenario.defensiveStrategies.high.description)
            ? randomScenario.defensiveStrategies.high.description
            : [randomScenario.defensiveStrategies.high.description]
        }
      }
    };

    // Update user data with stats
    const updatedUserData: PlayerData = {
      ...userData,
      stats
    };

    // Store all the necessary data
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    localStorage.setItem('selectedScenario', JSON.stringify(scenarioWithArrays));
    localStorage.setItem('selectedOpponent', JSON.stringify(randomOpponent));

    // Navigate directly to battle intro
    router.push('/battle-intro');
  };

  if (!userData) {
    return (
      <div className="relative min-h-screen">
        {/* Background with overlay */}
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 loading-container">
          <div className="loading-content backdrop-blur-[2px]">
            <div className="loading-text tron-text text-2xl" data-text="SYSTEM LOADING...">
              SYSTEM LOADING...
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
        {/* Background with overlay */}
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center mb-6">
            <h1 
              className="text-4xl font-bold uppercase tracking-wider mb-2 text-cyan-100"
              style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
            >
              Create Your Persona
            </h1>
            <p className="text-lg text-cyan-100">
              Remaining Budget: 
              <span className="text-xl ml-2 text-cyan-300 font-bold">
                {remainingPoints}
              </span>
            </p>
          </div>

          <div className="max-w-2xl w-full mx-auto">
            <div className="backdrop-blur-[2px] p-6 rounded-xl border-2 border-cyan-500/50 relative" 
              style={{ background: 'rgba(0, 10, 20, 0.8)' }}>
              <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-[borderPulse_2s_ease-in-out_infinite]" />
              <div className="relative z-10">
                {/* Avatar Section */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto mb-3 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-[borderPulse_2s_ease-in-out_infinite]" />
                    <img
                      src="/images/player-fox-image.png"
                      alt="Player Avatar"
                      className="w-full h-full object-cover rounded-full border-4 border-cyan-500/50"
                      style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
                    />
                  </div>
                  <div className="text-xl font-bold text-cyan-100 uppercase tracking-wider mb-1">
                    {userData.name}
                  </div>
                  <div className="text-md text-cyan-300/80 uppercase tracking-wider font-mono">
                    Legal Prodigy
                  </div>
                </div>

                <div className="h-px bg-cyan-500/30 mb-6" />

                {/* Stats Section */}
                <div className="space-y-4">
                  {(Object.keys(stats) as Array<keyof PlayerStats>).map((stat) => (
                    <div key={stat} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="text-lg block uppercase text-cyan-100 font-bold tracking-wider">
                            {stat}
                          </label>
                          <p className="text-xs text-cyan-300/80">
                            {stat === 'logic' && '(Technical reasoning and legal analysis)'}
                            {stat === 'charisma' && '(Persuasion and stakeholder influence)'}
                            {stat === 'risk' && '(Boldness in legal strategy)'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleStatChange(stat, stats[stat] - 1)}
                            className="px-3 py-1 rounded-lg border-2 border-cyan-500/50 text-cyan-100 transition-all duration-300
                              hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={stats[stat] <= MIN_STAT}
                            style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                          >
                            -
                          </button>
                          <div className="text-xl w-6 text-center text-cyan-100 font-bold" 
                               style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                            {stats[stat]}
                          </div>
                          <button
                            onClick={() => handleStatChange(stat, stats[stat] + 1)}
                            className="px-3 py-1 rounded-lg border-2 border-cyan-500/50 text-cyan-100 transition-all duration-300
                              hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={stats[stat] >= MAX_STAT || remainingPoints <= 0}
                            style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="stat-bar">
                        <div 
                          className="stat-bar-fill"
                          style={{ width: `${(stats[stat] / MAX_STAT) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {error && (
                    <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-2">
                      <p className="text-red-400 text-xs uppercase tracking-wider">Objection: {error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    className="w-full mt-4 px-6 py-2 rounded-lg text-lg uppercase tracking-wider transition-all duration-300
                      hover:scale-[1.02] text-cyan-100 border-2 border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed
                      disabled:hover:scale-100"
                    style={{ background: 'rgba(0, 10, 20, 0.9)', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                    disabled={remainingPoints < 0}
                  >
                    File Character Motion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 