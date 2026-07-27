import { useMemo } from 'react';
import { isDue } from '../engine/srs';
import { calculateNewCardsAllowed } from '../engine/newCardGate';
import { RANK_INFO } from '../config/constants';
import { countFastTrack } from '../engine/fastTrack';
import { todayISO } from '../data/storage';
import { signOut, getDisplayName } from '../lib/supabase';

export default function HomeScreen({ words, wordStats, playerStats, getStat, user, syncing, syncToCloud, onStart, onVault, onLeaderboard, onFlashcard, onAuth, onReset }) {
  const handleLogout = async () => {
    if (syncToCloud) await syncToCloud();
    await signOut();
  };
  const today = todayISO();
  const sameDay = playerStats.dailyDate === today;
  const newSeenCount = sameDay ? (playerStats.dailyNewSeen?.length || 0) : 0;
  const reviewSeenCount = sameDay ? (playerStats.dailyReviewSeen?.length || 0) : 0;
  const stats = useMemo(() => {
    const buckets = {
      new: 0,
      learning: 0,
      due: 0,
      mastered: 0,
      total: words.length,
      byInterval: { 1: 0, 3: 0, 7: 0, 14: 0, 30: 0, mastered: 0 },
    };

    for (const w of words) {
      const stat = getStat(w.id);
      if (stat.status === 'new') buckets.new++;
      else if (stat.status === 'learning') buckets.learning++;
      else if (stat.status === 'mastered') {
        buckets.mastered++;
        buckets.byInterval.mastered++;
      } else if (stat.status === 'review' || stat.status === 'relearning') {
        if (isDue(stat)) buckets.due++;
        if (typeof stat.interval === 'number') {
          buckets.byInterval[stat.interval] = (buckets.byInterval[stat.interval] || 0) + 1;
        }
      }
    }

    return buckets;
  }, [words, wordStats, getStat]);

  const newCardsAllowed = calculateNewCardsAllowed(wordStats);
  const fastTrackCount = countFastTrack(wordStats);
  const todoCount = stats.due + stats.learning + Math.min(stats.new, newCardsAllowed);

  const handleReset = () => {
    if (confirm('แน่ใจไหม? ข้อมูลทั้งหมดจะถูกลบ ไม่สามารถย้อนกลับได้')) {
      onReset();
    }
  };

  return (
    <div className="min-h-screen p-4 font-mono">
      <div className="max-w-md mx-auto">
        {/* === AUTH STATUS === */}
        <div className="flex justify-end items-center mb-2 text-xs gap-2">
          {syncing && <span className="text-zinc-500">⟳ ซิงค์...</span>}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">👤 {getDisplayName(user)}</span>
              <button
                onClick={handleLogout}
                disabled={syncing}
                className="text-zinc-500 hover:text-white disabled:text-zinc-700"
              >
                ออก
              </button>
            </div>
          ) : (
            <button
              onClick={onAuth}
              className="text-amber-400 hover:text-amber-300"
            >
              เข้าสู่ระบบ →
            </button>
          )}
        </div>

        {/* === TITLE === */}
        <h1 className="text-3xl text-center mb-2">⚔️</h1>
        <h2 className="text-xl text-center mb-6">GED RLA Dungeon</h2>

        {/* === TODAY === */}
        <div className="bg-zinc-900 rounded-lg p-4 mb-4">
          <div className="text-xs text-zinc-500 mb-1">วันนี้</div>
          <div className="text-2xl mb-2">
            {todoCount > 0
              ? `${todoCount} คำให้ทบทวน`
              : 'เคลียร์หมดแล้ว 🎉'}
          </div>
          <div className="text-xs text-zinc-400 grid grid-cols-3 gap-2">
            <div>Due: <span className="text-white">{stats.due}</span></div>
            <div>Learning: <span className="text-white">{stats.learning}</span></div>
            <div>New: <span className="text-white">{Math.min(stats.new, newCardsAllowed)}</span></div>
          </div>
        </div>

        {/* === DAILY COUNTER === */}
        <div className="bg-zinc-900 rounded-lg p-3 mb-4">
          <div className="text-xs text-zinc-500 mb-2">วันนี้เรียนไปแล้ว</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-zinc-950 rounded px-3 py-2 text-center">
              <div className="text-xs text-zinc-400 mb-1">คำใหม่</div>
              <div className="text-white text-lg">{newSeenCount}</div>
            </div>
            <div className="bg-zinc-950 rounded px-3 py-2 text-center">
              <div className="text-xs text-zinc-400 mb-1">คำทบทวน</div>
              <div className="text-white text-lg">{reviewSeenCount}</div>
            </div>
          </div>
        </div>

        {/* === START BUTTON === */}
        <button
          onClick={onStart}
          disabled={todoCount === 0}
          className="w-full p-4 bg-amber-700 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg text-lg mb-4"
        >
          ▶ Start Game
        </button>

        {/* === INTERVAL BAR === */}
        <button
          onClick={onVault}
          className="w-full bg-zinc-900 hover:bg-zinc-800 rounded-lg p-3 mb-4"
        >
          <div className="text-xs text-zinc-500 mb-2 text-left">ความก้าวหน้า (กดเพื่อดู Word Vault)</div>
          <div className="flex gap-1 text-xs">
            {[1, 3, 7, 14, 30, 'mastered'].map(key => {
              const info = RANK_INFO[key];
              const count = stats.byInterval[key];
              return (
                <div key={key} className="flex-1 text-center">
                  <div className={info.color}>{count}</div>
                  <div className="text-zinc-600 text-[10px]">{info.icon || key}</div>
                </div>
              );
            })}
          </div>
        </button>

        {/* === SECONDARY BUTTONS === */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={onVault}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded"
          >
            📚 Word Vault
          </button>
          <button
            onClick={onLeaderboard}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={onFlashcard}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded col-span-2"
          >
            🃏 Flashcard (Anki Mode)
          </button>
        </div>

        {/* === STATS === */}
        <div className="bg-zinc-900 rounded-lg p-3 mb-4 text-xs">
          <div className="text-zinc-500 mb-2">สถิติ</div>
          <div className="grid grid-cols-2 gap-2 text-zinc-300">
            <div>High Score: <span className="text-white">{playerStats.highScore}</span></div>
            <div>Streak: <span className="text-white">{playerStats.streak}</span></div>
            <div>Total Seen: <span className="text-white">{playerStats.totalSeen}</span></div>
            <div>Mastered: <span className="text-white">{stats.mastered}/{stats.total}</span></div>
          </div>
          {fastTrackCount > 0 && (
            <div className="mt-2 pt-2 border-t border-zinc-800 text-amber-400">
              ⚡ Fast Track: {fastTrackCount} คำ
            </div>
          )}
        </div>

        {/* === RESET === */}
        <button
          onClick={handleReset}
          className="w-full p-2 bg-zinc-900 hover:bg-red-900 rounded text-xs text-zinc-500"
        >
          🗑️ Reset Progress
        </button>
      </div>
    </div>
  );
}
