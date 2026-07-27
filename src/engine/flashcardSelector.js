import { todayISO } from '../data/storage';
import { createDefaultFlashcardStat, isLearningCard, isLearningCardReady } from './sm2';

// เลือกคำถัดไปแบบ Anki
//
// ลำดับความสำคัญ:
//   1) คำในขั้นเรียนที่ "ถึงเวลาแล้ว" (dueAt ผ่านไปแล้ว) — เก่าสุดก่อน
//   2) คำทบทวนที่ถึงกำหนดวันนี้ (ตามโควต้า)
//   3) คำใหม่ (ตามโควต้า)
//   4) คำในขั้นเรียนที่ "ยังไม่ถึงเวลา" — ใช้เมื่อไม่มีคำอื่นให้ทำแล้วเท่านั้น
//
// ข้อ 4 อยู่ท้ายสุด ทำให้คำที่เพิ่งกด Again ถูกดันไปหลังคำอื่น ไม่โผล่ติดกัน
//
// continueMode = กด "เล่นต่อ" หลังหมดโควต้า → ปลดล็อกเฉพาะคำทบทวนส่วนเกิน
//                คำใหม่ไม่โผล่เพิ่มเด็ดขาด
export function selectNextFlashcard(words, stats, daily, settings, continueMode = false, excludeId = null) {
  const today = todayISO();
  const now = Date.now();

  const combined = words.map(w => ({
    word: w,
    stat: stats[w.id] || createDefaultFlashcardStat(),
  }));

  // คำในขั้นเรียน (learning/relearning) — แยกเป็นถึงเวลาแล้ว กับยังไม่ถึง
  const learningAll = combined
    .filter(({ stat }) => isLearningCard(stat))
    .sort((a, b) => (a.stat.dueAt ?? 0) - (b.stat.dueAt ?? 0));

  const learningReady = learningAll.filter(({ stat }) => isLearningCardReady(stat, now));
  const learningWaiting = learningAll.filter(({ stat }) => !isLearningCardReady(stat, now));

  // คำทบทวนที่ถึงกำหนดวันนี้ (เก่าสุดก่อน)
  const reviewsDue = combined
    .filter(({ stat }) =>
      stat.status === 'review' && stat.nextReview && stat.nextReview <= today
    )
    .sort((a, b) => (a.stat.nextReview < b.stat.nextReview ? -1 : 1));

  // คำใหม่
  const newPool = combined.filter(({ stat }) => stat.status === 'new');

  // โควต้าที่เหลือวันนี้
  const reviewQuotaLeft = Math.max(0, settings.reviewsPerDay - daily.reviewsSeen.length);
  const newQuotaLeft = Math.max(0, settings.newPerDay - daily.newSeen.length);

  const eligibleReviews = continueMode ? reviewsDue : reviewsDue.slice(0, reviewQuotaLeft);
  const eligibleNew = continueMode ? [] : newPool.slice(0, newQuotaLeft);

  const queue = [
    ...learningReady,
    ...eligibleReviews,
    ...eligibleNew,
    ...learningWaiting,
  ];

  if (queue.length === 0) return null;

  // กันคำเดิมโผล่ติดกัน ถ้ายังมีคำอื่นให้เลือก
  const filtered = queue.filter(({ word }) => word.id !== excludeId);
  const pool = filtered.length > 0 ? filtered : queue;

  return pool[0];
}

// นับว่าเหลือคำ due เกินโควต้าอีกกี่คำ (ใช้ตัดสินใจว่าจะโชว์ปุ่ม "เล่นต่อ" ไหม)
export function countRemainingBeyondLimit(words, stats, daily, settings) {
  const today = todayISO();
  const reviewsDue = words.filter(w => {
    const stat = stats[w.id];
    return stat && stat.status === 'review' && stat.nextReview && stat.nextReview <= today;
  });
  const reviewQuotaLeft = Math.max(0, settings.reviewsPerDay - daily.reviewsSeen.length);
  return Math.max(0, reviewsDue.length - reviewQuotaLeft);
}
