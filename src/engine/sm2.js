import { SM2 } from '../config/constants';
import { todayISO, addDays } from '../data/storage';

// 4 ปุ่มประเมินแบบ Anki
export const RATINGS = {
  AGAIN: 'again',
  HARD: 'hard',
  GOOD: 'good',
  EASY: 'easy',
};

// สถานะของ flashcard:
// new        = ยังไม่เคยเห็นเลย
// learning   = คำใหม่ที่กำลังเรียน (ต้องกด Good ครบตามจำนวน step)
// review     = เข้าสู่ระบบ interval แล้ว
// relearning = เคย review แล้วกด Again ต้องเรียนซ้ำในรอบนี้

export function createDefaultFlashcardStat() {
  return {
    status: 'new',
    ease: SM2.STARTING_EASE,
    interval: 0,          // หน่วยเป็นวัน
    learningStep: 0,
    nextReview: null,     // YYYY-MM-DD (null = ยังอยู่ใน learning/new)
    lastSeen: null,
    userId: 'local_user',
    source: 'ged_rla',
  };
}

function clampEase(ease) {
  return Math.max(SM2.MIN_EASE, ease);
}

function capInterval(days) {
  return Math.min(SM2.MAX_INTERVAL, Math.max(1, Math.round(days)));
}

// หัวใจของ SM-2: รับ stat + ปุ่มที่กด → คืน stat ใหม่
export function rateCard(stat, rating) {
  const now = todayISO();
  const s = { ...stat, lastSeen: now };

  // === คำใหม่ / กำลังเรียน ===
  if (s.status === 'new' || s.status === 'learning') {
    if (rating === RATINGS.AGAIN) {
      return { ...s, status: 'learning', learningStep: 0 };
    }
    if (rating === RATINGS.HARD) {
      // ย้ำ step เดิม ไม่เดินหน้า
      return { ...s, status: 'learning' };
    }
    if (rating === RATINGS.EASY) {
      // ข้าม learning ไปเลย
      return {
        ...s,
        status: 'review',
        learningStep: 0,
        interval: SM2.EASY_GRADUATE_INTERVAL,
        nextReview: addDays(now, SM2.EASY_GRADUATE_INTERVAL),
      };
    }
    // GOOD → เดินหน้าทีละ step
    const nextStep = s.learningStep + 1;
    if (nextStep >= SM2.LEARNING_STEPS) {
      return {
        ...s,
        status: 'review',
        learningStep: 0,
        interval: SM2.GRADUATE_INTERVAL,
        nextReview: addDays(now, SM2.GRADUATE_INTERVAL),
      };
    }
    return { ...s, status: 'learning', learningStep: nextStep };
  }

  // === เรียนซ้ำ (เคยกด Again ตอน review) ===
  if (s.status === 'relearning') {
    if (rating === RATINGS.AGAIN || rating === RATINGS.HARD) {
      return { ...s, learningStep: 0 };
    }
    // GOOD / EASY → กลับเข้า review เริ่มที่ 1 วัน
    return {
      ...s,
      status: 'review',
      learningStep: 0,
      interval: SM2.GRADUATE_INTERVAL,
      nextReview: addDays(now, SM2.GRADUATE_INTERVAL),
    };
  }

  // === review ปกติ ===
  if (rating === RATINGS.AGAIN) {
    return {
      ...s,
      status: 'relearning',
      learningStep: 0,
      ease: clampEase(s.ease + SM2.EASE_AGAIN_DELTA),
      nextReview: null,
    };
  }
  if (rating === RATINGS.HARD) {
    const newInterval = capInterval(
      Math.max(s.interval * SM2.HARD_INTERVAL_MULTIPLIER, s.interval + 1)
    );
    return {
      ...s,
      ease: clampEase(s.ease + SM2.EASE_HARD_DELTA),
      interval: newInterval,
      nextReview: addDays(now, newInterval),
    };
  }
  if (rating === RATINGS.EASY) {
    const newEase = clampEase(s.ease + SM2.EASE_EASY_DELTA);
    const newInterval = capInterval(
      Math.max(s.interval * newEase * SM2.EASY_BONUS, s.interval + 1)
    );
    return {
      ...s,
      ease: newEase,
      interval: newInterval,
      nextReview: addDays(now, newInterval),
    };
  }
  // GOOD
  const newInterval = capInterval(
    Math.max(s.interval * s.ease, s.interval + 1)
  );
  return {
    ...s,
    interval: newInterval,
    nextReview: addDays(now, newInterval),
  };
}

// card นี้ due วันนี้ไหม (learning/relearning = due เสมอเพราะต้องจบในรอบ)
export function isCardDue(stat) {
  if (stat.status === 'new') return true;
  if (stat.status === 'learning' || stat.status === 'relearning') return true;
  if (!stat.nextReview) return true;
  return stat.nextReview <= todayISO();
}

// ข้อความ preview ใต้ปุ่ม (เหมือน Anki บอกว่ากดแล้วจะเจออีกทีเมื่อไหร่)
export function getIntervalPreview(stat, rating) {
  const result = rateCard(stat, rating);
  if (result.status === 'learning' || result.status === 'relearning') {
    return 'เรียนต่อ';
  }
  return `${result.interval} วัน`;
}
