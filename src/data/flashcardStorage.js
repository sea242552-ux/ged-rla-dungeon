import { STORAGE_KEYS, FLASHCARD_LIMITS } from '../config/constants';
import { todayISO } from './storage';
import { createDefaultFlashcardStat } from '../engine/sm2';

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

// ========== Flashcard Stats (สถานะ SM-2 ของแต่ละคำ — แยกจาก Dungeon) ==========
export function getFlashcardStats() {
  return read(STORAGE_KEYS.FLASHCARD_STATS, {});
}

export function saveFlashcardStats(stats) {
  write(STORAGE_KEYS.FLASHCARD_STATS, stats);
}

export function getFlashcardStat(wordId) {
  const stats = getFlashcardStats();
  return stats[wordId] || createDefaultFlashcardStat();
}

export function updateFlashcardStat(wordId, newStat) {
  const stats = getFlashcardStats();
  stats[wordId] = newStat;
  saveFlashcardStats(stats);
  return stats;
}

// ========== Settings (daily limits ปรับได้) ==========
export function getFlashcardSettings() {
  return read(STORAGE_KEYS.FLASHCARD_SETTINGS, {
    newPerDay: FLASHCARD_LIMITS.NEW_PER_DAY_DEFAULT,
    reviewsPerDay: FLASHCARD_LIMITS.REVIEWS_PER_DAY_DEFAULT,
  });
}

export function saveFlashcardSettings(settings) {
  write(STORAGE_KEYS.FLASHCARD_SETTINGS, settings);
}

// ========== Daily counter (นับคำที่ทำไปแล้ววันนี้ — reset อัตโนมัติเมื่อข้ามวัน) ==========
export function getFlashcardDaily() {
  const daily = read(STORAGE_KEYS.FLASHCARD_DAILY, null);
  const today = todayISO();
  if (!daily || daily.date !== today) {
    return { date: today, newSeen: [], reviewsSeen: [] };
  }
  return daily;
}

export function saveFlashcardDaily(daily) {
  write(STORAGE_KEYS.FLASHCARD_DAILY, daily);
}

// นับคำเข้าโควต้าวันนี้ (คำละครั้งเดียวต่อวัน)
// prevStatus = สถานะก่อนกดปุ่มประเมิน
export function trackDailyCard(wordId, prevStatus) {
  const daily = getFlashcardDaily();
  if (prevStatus === 'new' && !daily.newSeen.includes(wordId)) {
    daily.newSeen = [...daily.newSeen, wordId];
    saveFlashcardDaily(daily);
  } else if (prevStatus === 'review' && !daily.reviewsSeen.includes(wordId)) {
    daily.reviewsSeen = [...daily.reviewsSeen, wordId];
    saveFlashcardDaily(daily);
  }
  return daily;
}
