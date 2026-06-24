import { useEffect, useState } from 'react';
import { addLeaderboardEntry, getPlayerStats, updatePlayerStats } from '../data/storage';
import { submitScore, fetchOnlineLeaderboard, getDisplayName } from '../lib/supabase';

export default function GameOverScreen({ result, playerStats, user, onPlayAgain, onHome }) {
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState(() => getDisplayName(user) || '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [onlineBoard, setOnlineBoard] = useState([]);
  const [myOnlineRank, setMyOnlineRank] = useState(null);

  useEffect(() => {
    if (saved || !result) return;

    const entry = {
      score: result.score,
      floor: result.floor,
      wordsLearned: result.wordsLearned,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = addLeaderboardEntry(entry);
    setLeaderboard(updated.map((e, i) => ({ ...e, rank: i + 1 })));

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const ps = getPlayerStats();
    let newStreak = ps.streak;
    if (ps.lastPlayed === today) {
      // เล่นซ้ำในวันเดิม streak ไม่เปลี่ยน
    } else if (ps.lastPlayed === yesterday) {
      newStreak = ps.streak + 1;
    } else {
      newStreak = 1;
    }
    updatePlayerStats({
      lastPlayed: today,
      streak: newStreak,
      totalLearned: ps.totalLearned + result.wordsLearned,
    });

    setSaved(true);
  }, [result, saved]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    const { error } = await submitScore({
      name: name.trim(),
      score: result.score,
      floor: result.floor,
      wordsLearned: result.wordsLearned,
    });
    if (!error) {
      const { data } = await fetchOnlineLeaderboard();
      if (data) {
        setOnlineBoard(data);
        const rank = data.findIndex(e => e.score === result.score && e.name === name.trim()) + 1;
        setMyOnlineRank(rank || null);
      }
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (!result) return null;

  const isNewHigh = result.score >= playerStats.highScore && result.score > 0;
  const myLocalRank = leaderboard.findIndex(e =>
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
              <div className="text-zinc-500">Local Rank</div>
              <div className="text-white text-lg">#{myLocalRank || '-'}</div>
            </div>
          </div>
        </div>

        {/* === WRONG ANSWERS === */}
        {result.wrongAnswers.length > 0 && (
          <div className="bg-zinc-900 rounded-lg p-4 mb-4">
            <div className="text-xs text-zinc-500 mb-2">
              คำที่ตอบผิด ({result.wrongAnswers.length})
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {result.wrongAnswers.map((w, i) => (
                <div key={i} className="flex justify-between text-sm bg-zinc-950 p-2 rounded">
                  <span className="text-red-400">{w.word}</span>
                  <span className="text-zinc-500 text-xs">{w.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === SUBMIT ONLINE === */}
        {!submitted ? (
          <div className="bg-zinc-900 rounded-lg p-4 mb-4">
            <div className="text-xs text-zinc-500 mb-2">🌐 ส่งคะแนนขึ้น Online Leaderboard</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="ใส่ชื่อของคุณ"
                maxLength={20}
                className="flex-1 bg-zinc-800 rounded px-3 py-2 text-white text-sm outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || submitting}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 rounded text-sm"
              >
                {submitting ? '...' : 'ส่ง'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-lg p-4 mb-4">
            <div className="text-xs text-zinc-500 mb-2">
              🌐 Online Top 10
              {myOnlineRank && <span className="text-amber-400 ml-2">อันดับของคุณ: #{myOnlineRank}</span>}
            </div>
            <div className="space-y-1 text-sm">
              {onlineBoard.map((entry, i) => {
                const isMine = entry.name === name.trim() && entry.score === result.score;
                return (
                  <div
                    key={i}
                    className={`flex justify-between p-2 rounded ${isMine ? 'bg-amber-900/30' : ''}`}
                  >
                    <span className="text-zinc-400">#{i + 1}</span>
                    <span className={isMine ? 'text-amber-400' : 'text-white'}>{entry.name}</span>
                    <span className="text-white">{entry.score}</span>
                    <span className="text-xs text-zinc-500">Fl.{entry.floor}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === BUTTONS === */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onHome} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded">
            หน้าแรก
          </button>
          <button onClick={onPlayAgain} className="p-3 bg-amber-700 hover:bg-amber-600 rounded">
            เล่นอีกครั้ง
          </button>
        </div>

      </div>
    </div>
  );
}
