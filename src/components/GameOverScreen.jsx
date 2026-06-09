import { useEffect, useState } from 'react';
import { addLeaderboardEntry, getPlayerStats, updatePlayerStats } from '../data/storage';

export default function GameOverScreen({ result, playerStats, onPlayAgain, onHome }) {
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (saved || !result) return;

    // === Save leaderboard ===
    const entry = {
      score: result.score,
      floor: result.floor,
      wordsLearned: result.wordsLearned,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = addLeaderboardEntry(entry);
    setLeaderboard(updated.map((e, i) => ({ ...e, rank: i + 1 })));

    // === Update streak ===
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const ps = getPlayerStats();
    let newStreak = ps.streak;
    if (ps.lastPlayed === today) {
      // เล่นซ้ำในวันเดิม streak ไม่เปลี่ยน
    } else if (ps.lastPlayed === yesterday) {
      newStreak = ps.streak + 1;
    } else {
      newStreak = 1;  // streak reset
    }
    updatePlayerStats({
      lastPlayed: today,
      streak: newStreak,
      totalLearned: ps.totalLearned + result.wordsLearned,
    });

    setSaved(true);
  }, [result, saved]);

  if (!result) return null;

  const isNewHigh = result.score >= playerStats.highScore && result.score > 0;
  const myRank = leaderboard.findIndex(e =>
    e.score === result.score && e.date === new Date().toISOString().split('T')[0]
  ) + 1;

  return (
    <div className="min-h-screen p-4 font-mono">
      <div className="max-w-md mx-auto">
        {/* === TITLE === */}
        <h2 className="text-2xl text-center mb-2">💀 Game Over</h2>
        {isNewHigh && (
          <div className="text-center text-amber-400 text-sm mb-4">🏆 NEW HIGH SCORE!</div>
        )}

        {/* === SUMMARY === */}
        <div className="bg-zinc-900 rounded-lg p-4 mb-4 text-center">
          <div className="text-xs text-zinc-500 mb-1">Score</div>
          <div className="text-4xl mb-4">{result.score}</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-zinc-500">Floor</div>
              <div className="text-white text-lg">{result.floor}</div>
            </div>
            <div>
              <div className="text-zinc-500">Words</div>
              <div className="text-white text-lg">{result.wordsLearned}</div>
            </div>
            <div>
              <div className="text-zinc-500">Rank</div>
              <div className="text-white text-lg">#{myRank || '-'}</div>
            </div>
          </div>
        </div>

        {/* === WRONG ANSWERS === */}
        {result.wrongAnswers.length > 0 && (
          <div className="bg-zinc-900 rounded-lg p-4 mb-4">
            <div className="text-xs text-zinc-500 mb-2">
              คำที่ตอบผิด ({result.wrongAnswers.length})
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {result.wrongAnswers.map((w, i) => (
                <div key={i} className="flex justify-between text-sm bg-zinc-950 p-2 rounded">
                  <span className="text-red-400">{w.word}</span>
                  <span className="text-zinc-500 text-xs">{w.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === LEADERBOARD === */}
        <div className="bg-zinc-900 rounded-lg p-4 mb-4">
          <div className="text-xs text-zinc-500 mb-2">🏆 Top 10</div>
          <div className="space-y-1 text-sm">
            {leaderboard.slice(0, 10).map((entry, i) => {
              const isMine = i + 1 === myRank;
              return (
                <div
                  key={i}
                  className={`flex justify-between p-2 rounded ${isMine ? 'bg-amber-900/30' : ''}`}
                >
                  <span className="text-zinc-400">#{i + 1}</span>
                  <span className="text-white">{entry.score}</span>
                  <span className="text-xs text-zinc-500">Fl.{entry.floor}</span>
                  <span className="text-xs text-zinc-600">{entry.date}</span>
                </div>
              );
            })}
            {leaderboard.length === 0 && (
              <div className="text-zinc-500 text-center py-2">ยังไม่มีคะแนน</div>
            )}
          </div>
        </div>

        {/* === BUTTONS === */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onHome}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded"
          >
            หน้าแรก
          </button>
          <button
            onClick={onPlayAgain}
            className="p-3 bg-amber-700 hover:bg-amber-600 rounded"
          >
            เล่นอีกครั้ง
          </button>
        </div>
      </div>
    </div>
  );
}
