import { useEffect, useState } from 'react';
import { fetchOnlineLeaderboard } from '../lib/supabase';

export default function LeaderboardScreen({ onBack }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchOnlineLeaderboard().then(({ data, error }) => {
      if (error) setError(true);
      else setBoard(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen p-4 font-mono">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-white">← Back</button>
          <h2 className="text-lg">🏆 Online Leaderboard</h2>
          <div className="w-12" />
        </div>

        <div className="bg-zinc-900 rounded-lg p-4">
          {loading && (
            <div className="text-zinc-500 text-center py-4">กำลังโหลด...</div>
          )}
          {error && (
            <div className="text-red-400 text-center py-4 text-sm">โหลดไม่ได้ ลองใหม่อีกครั้ง</div>
          )}
          {!loading && !error && board.length === 0 && (
            <div className="text-zinc-500 text-center py-4">ยังไม่มีคะแนน — เป็นคนแรกได้เลย!</div>
          )}
          {!loading && board.map((entry, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0 text-sm">
              <span className="text-zinc-400 w-6">#{i + 1}</span>
              <span className="text-white flex-1 ml-2">{entry.name}</span>
              <span className="text-amber-400 font-bold">{entry.score}</span>
              <span className="text-zinc-500 ml-3 text-xs">Fl.{entry.floor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
