import { useEffect, useState } from 'react';
import { getLeaderboard } from '../data/storage';

export default function LeaderboardScreen({ onBack }) {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    setBoard(getLeaderboard());
  }, []);

  return (
    <div className="min-h-screen p-4 font-mono">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-white">← Back</button>
          <h2 className="text-lg">🏆 Leaderboard</h2>
          <div className="w-12" />
        </div>

        <div className="bg-zinc-900 rounded-lg p-4">
          {board.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              ยังไม่มีคะแนน<br />
              <span className="text-xs">เล่นเกมเพื่อบันทึกคะแนนแรก</span>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {board.map((entry, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-zinc-950 rounded">
                  <span className="text-zinc-400 w-8">#{i + 1}</span>
                  <span className="text-white text-lg flex-1 text-center">{entry.score}</span>
                  <span className="text-xs text-zinc-500 mx-2">Fl.{entry.floor}</span>
                  <span className="text-xs text-zinc-500">{entry.wordsLearned} คำ</span>
                  <span className="text-xs text-zinc-600 ml-2">{entry.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
