import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface LeaderboardEntry {
  playerName: string;
  score: number;
  date: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load leaderboard data from localStorage
    const loadLeaderboard = () => {
      const storedLeaderboard = localStorage.getItem('leaderboard');
      if (storedLeaderboard) {
        const parsedLeaderboard = JSON.parse(storedLeaderboard);
        // Sort by score in descending order and take top 10
        const sortedLeaderboard = parsedLeaderboard
          .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
          .slice(0, 10);
        setLeaderboard(sortedLeaderboard);
      }
      setLoading(false);
    };

    loadLeaderboard();
  }, []);

  const handleStartGame = () => {
    // Set flag to indicate we're coming from leaderboard
    sessionStorage.setItem('fromLeaderboard', 'true');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center backdrop-blur-[2px]">
            <div className="text-4xl font-bold text-cyan-400 mb-6 animate-pulse tracking-widest uppercase">
              LOADING LEADERBOARD
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 courtroom-bg opacity-50" />
      <div className="absolute inset-0 bg-black/50 tron-grid" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-cyan-100 mb-4 tracking-widest uppercase"
                style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
              Legal Hall of Fame
            </h1>
            <p className="text-xl text-cyan-300/80 mb-8">Where Legal Legends Make Their Mark</p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl border-2 border-cyan-500/30 mb-8 overflow-hidden">
            {leaderboard.length > 0 ? (
              <div className="divide-y divide-cyan-500/20">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={index}
                    className={`flex items-center p-6 ${
                      index === 0 ? 'bg-emerald-400/10' :
                      index === 1 ? 'bg-cyan-400/10' :
                      index === 2 ? 'bg-amber-400/10' :
                      'hover:bg-cyan-900/20'
                    } transition-colors duration-200`}
                  >
                    <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center mr-6 border-2 ${
                      index === 0 ? 'border-emerald-500 text-emerald-400' :
                      index === 1 ? 'border-cyan-500 text-cyan-400' :
                      index === 2 ? 'border-amber-500 text-amber-400' :
                      'border-cyan-500/50 text-cyan-300'
                    }`}>
                      <span className="text-2xl font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className={`text-xl font-bold mb-1 ${
                        index === 0 ? 'text-emerald-400' :
                        index === 1 ? 'text-cyan-400' :
                        index === 2 ? 'text-amber-400' :
                        'text-cyan-300'
                      }`}>
                        {entry.playerName}
                      </h3>
                      <p className="text-cyan-300/80 text-sm">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-3xl font-bold ${
                      index === 0 ? 'text-emerald-400' :
                      index === 1 ? 'text-cyan-400' :
                      index === 2 ? 'text-amber-400' :
                      'text-cyan-300'
                    }`}>
                      {entry.score}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-cyan-300/80 text-lg">No defenders have made their mark yet.</p>
                <p className="text-cyan-400 text-sm mt-2">Be the first to enter the hall of fame!</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={handleStartGame}
              className="relative group overflow-hidden px-10 py-3 bg-cyan-500/10 text-cyan-400 
                rounded-lg border-2 border-cyan-500/50 
                hover:bg-cyan-500 hover:text-white transition-all duration-300 
                uppercase tracking-widest font-bold text-lg
                shadow-[0_0_20px_rgba(0,191,255,0.3)]
                hover:shadow-[0_0_30px_rgba(0,191,255,0.5)]"
            >
              <span className="relative z-10">Enter The Arena</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-400 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 