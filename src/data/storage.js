import { STORAGE_KEYS } from '../config/constants';

// ========== Generic helpers ==========
function read(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${key}:`, e);
    return defaultValue;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write ${key}:`, e);
  }
}

// ========== Word Stats ==========
export function getWordStats() {
  return read(STORAGE_KEYS.WORD_STATS, {});
}

export function saveWordStats(stats) {
  write(STORAGE_KEYS.WORD_STATS, stats);
}

export function getWordStat(wordId) {
  const stats = getWordStats();
  return stats[wordId] || createDefaultStat();
}

export function updateWordStat(wordId, updates) {
  const stats = getWordStats();
  const current = stats[wordId] || createDefaultStat();
  stats[wordId] = { ...current, ...updates };
  saveWordStats(stats);
  return stats[wordId];
}

export function createDefaultStat() {
  return {
    status: 'new',
    interval: 0,
    learningCount: 0,
    nextReview: null,
    lastSeen: null,
    fastTrack: false,
    userId: 'local_user',
    source: 'ged_rla',
  };
}

// ========== Player Stats ==========
export function getPlayerStats() {
  return read(STORAGE_KEYS.PLAYER_STATS, {
    streak: 0,
    lastPlayed: null,
    totalSeen: 0,
    totalLearned: 0,
    highScore: 0,
  });
}

export function savePlayerStats(stats) {
  write(STORAGE_KEYS.PLAYER_STATS, stats);
}

export function updatePlayerStats(updates) {
  const current = getPlayerStats();
  const updated = { ...current, ...updates };
  savePlayerStats(updated);
  return updated;
}

// ========== Leaderboard ==========
export function getLeaderboard() {
  return read(STORAGE_KEYS.LEADERBOARD, []);
}

export function addLeaderboardEntry(entry) {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const top10 = board.slice(0, 10);
  write(STORAGE_KEYS.LEADERBOARD, top10);
  return top10;
}

// ========== Reset ==========
export function resetAllProgress() {
  localStorage.removeItem(STORAGE_KEYS.WORD_STATS);
  localStorage.removeItem(STORAGE_KEYS.PLAYER_STATS);
  localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
}

// ========== Date helpers ==========
export function todayISO() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export function addDays(dateStr, days) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function daysBetween(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}
