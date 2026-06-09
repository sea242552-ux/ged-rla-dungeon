import { INTERVAL_WEIGHTS, GAME } from '../config/constants';
import { todayISO, daysBetween } from '../data/storage';

export function calculatePriority(stat) {
  const intervalKey = stat.interval === 'mastered' ? 'mastered' : stat.interval;
  const intervalWeight = INTERVAL_WEIGHTS[intervalKey] ?? 0;

  let overdueDays = 0;
  if (stat.nextReview) {
    overdueDays = Math.max(0, daysBetween(stat.nextReview, todayISO()));
  }

  return {
    score: intervalWeight * 2 + overdueDays,
    overdue: overdueDays,
  };
}

export function sortByPriority(wordsWithStats) {
  return [...wordsWithStats].sort((a, b) => {
    const pa = calculatePriority(a.stat);
    const pb = calculatePriority(b.stat);
    if (pb.score !== pa.score) return pb.score - pa.score;
    if (pb.overdue !== pa.overdue) return pb.overdue - pa.overdue;
    return Math.random() - 0.5;
  });
}

export function selectBossWord(wordsWithStats) {
  const eligible = wordsWithStats.filter(({ stat }) => {
    if (stat.status === 'mastered') return true;
    if (stat.status === 'review' && typeof stat.interval === 'number' && stat.interval >= GAME.BOSS_MIN_INTERVAL) return true;
    return false;
  });

  if (eligible.length === 0) return null;

  const rankOrder = ['mastered', 30, 14, 7];
  for (const targetRank of rankOrder) {
    const matches = eligible.filter(({ stat }) => {
      if (targetRank === 'mastered') return stat.status === 'mastered';
      return stat.interval === targetRank;
    });
    if (matches.length === 0) continue;

    const sorted = matches.sort((a, b) => {
      const da = a.stat.lastSeen ? daysBetween(a.stat.lastSeen, todayISO()) : 999;
      const db = b.stat.lastSeen ? daysBetween(b.stat.lastSeen, todayISO()) : 999;
      if (db !== da) return db - da;
      return Math.random() - 0.5;
    });
    return sorted[0];
  }

  return null;
}
