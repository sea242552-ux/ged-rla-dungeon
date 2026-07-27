import { todayISO } from '../data/storage';
import { createDefaultFlashcardStat } from './sm2';

// เลือกคำถัดไปแบบ Anki
// ลำดับ: 1) คำทบทวนที่ due (เก่าสุดก่อน)  2) คำใหม่ (ตามลำดับใน words.json)
//        3) คำ learning/relearning (วนจนกว่าจะ graduate)
//
// continueMode = กด "เล่นต่อ" หลังหมดโควต้า → ปลดล็อกเฉพาะคำทบทวนส่วนเกิน
//                คำใหม่ไม่โผล่เพิ่มเด็ดขาด
export function selectNextFlashcard(words, stats, daily, settings, continueMode = false, excludeId = null) {
  const today = todayISO();

  const combined = words.map(w => ({
    word: w,
    stat: stats[w.id] || createDefaultFlashcardStat(),
  }));

  // คำทบทวนที่ถึงกำหนดวันนี้
  const reviewsDue = combined
    .filter(({ stat }) =>
      stat.status === 'review' && stat.nextReview && stat.nextReview <= today
    )
    .sort((a, b) => (a.stat.nextReview < b.stat.nextReview ? -1 : 1));

  // คำที่กำลังเรียนค้างอยู่ (ต้องจบให้ครบ ไม่นับโควต้า)
  const learningPool = combined
    .filter(({ stat }) => stat.status === 'learning' || stat.status === 'relearning')
    .sort((a, b) => ((a.stat.lastSeen || '') < (b.stat.lastSeen || '') ? -1 : 1));

  // คำใหม่
  const newPool = combined.filter(({ stat }) => stat.status === 'new');

  // โควต้าที่เหลือวันนี้
  const reviewQuotaLeft = Math.max(0, settings.reviewsPerDay - daily.reviewsSeen.length);
  const newQuotaLeft = Math.max(0, settings.newPerDay - daily.newSeen.length);

  const eligibleReviews = continueMode ? reviewsDue : reviewsDue.slice(0, reviewQuotaLeft);
  const eligibleNew = continueMode ? [] : newPool.slice(0, newQuotaLeft);

  const queue = [...eligibleReviews, ...eligibleNew, ...learningPool];

  if (queue.length === 0) return null;

  // กันคำเดิมโผล่ติดกัน (ถ้ามีคำอื่นให้เลือก)
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
