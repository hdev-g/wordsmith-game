import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface LeaderboardScore {
  id: string;
  score: number;
  user: {
    name: string;
  };
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [scores, setScores] = useState<LeaderboardScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        setScores(data.scores);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard. Please try again.');
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

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

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />
        
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center max-w-md mx-auto p-8 backdrop-blur-[2px] rounded-xl border-2 border-red-500/50">
            <div className="text-2xl font-bold text-red-500 mb-4">Error</div>
            <div className="text-red-300 mb-6">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 courtroom-bg opacity-50" />
      <div className="absolute inset-0 bg-black/50 tron-grid" />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-cyan-100 mb-12 text-center tracking-widest uppercase"
            style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
          Legal Hall of Fame
        </h1>

        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-sm rounded-xl border-2 border-cyan-500/30 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-4 bg-cyan-500/10 border-b border-cyan-500/30 text-cyan-300 font-bold">
            <div className="w-12 text-center">#</div>
            <div>Player</div>
            <div className="text-right px-4">Score</div>
          </div>

          {scores.map((score, index) => (
            <div 
              key={score.id}
              className={`grid grid-cols-3 gap-4 p-4 items-center
                ${index % 2 === 0 ? 'bg-cyan-500/5' : 'bg-transparent'}
                ${index === 0 ? 'bg-yellow-500/10 border-2 border-yellow-500/30' : ''}
              `}
            >
              <div className="w-12 text-center font-bold text-cyan-400">
                {index + 1}
              </div>
              <div className="text-cyan-100">{score.user.name}</div>
              <div className="text-right px-4 font-mono text-cyan-400">
                {score.score}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => {
              sessionStorage.setItem('fromLeaderboard', 'true');
              router.push('/');
            }}
            className="px-8 py-3 bg-cyan-500/10 text-cyan-400 rounded-lg border-2 border-cyan-500/50 
              hover:bg-cyan-500 hover:text-white transition-all duration-300 
              uppercase tracking-wider font-bold"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
} 