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
// learning   = คำใหม่ที่กำลังเรียน (นับเป็นนาที)
// review     = เข้าสู่ระบบ interval รายวันแล้ว
// relearning = เคย review แล้วกด Again ต้องเรียนซ้ำ (นับเป็นนาที)

const MS_PER_MINUTE = 60 * 1000;

export function createDefaultFlashcardStat() {
  return {
    status: 'new',
    ease: SM2.STARTING_EASE,
    interval: 0,          // หน่วยเป็นวัน (ใช้ตอน status = review)
    learningStep: 0,
    dueAt: null,          // timestamp (ms) — ใช้ตอน learning/relearning
    nextReview: null,     // YYYY-MM-DD — ใช้ตอน review
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

function minutesFromNow(minutes) {
  return Date.now() + minutes * MS_PER_MINUTE;
}

// learning steps ที่ใช้ ขึ้นกับว่าเป็นคำใหม่หรือคำที่ลืม
function stepsFor(status) {
  return status === 'relearning'
    ? SM2.RELEARNING_STEPS_MINUTES
    : SM2.LEARNING_STEPS_MINUTES;
}

// จบขั้น learning → เข้าสู่ระบบ interval รายวัน
function graduate(stat, intervalDays) {
  return {
    ...stat,
    status: 'review',
    learningStep: 0,
    dueAt: null,
    interval: intervalDays,
    nextReview: addDays(todayISO(), intervalDays),
  };
}

// หัวใจของ SM-2: รับ stat + ปุ่มที่กด → คืน stat ใหม่
export function rateCard(stat, rating) {
  const s = { ...stat, lastSeen: todayISO() };
  const inLearning = s.status === 'new' || s.status === 'learning' || s.status === 'relearning';

  // === คำใหม่ / กำลังเรียน / เรียนซ้ำ ===
  if (inLearning) {
    // คำใหม่ที่เพิ่งเจอครั้งแรก นับเป็น learning ต่อจากนี้
    const nextStatus = s.status === 'relearning' ? 'relearning' : 'learning';
    const steps = stepsFor(nextStatus);

    if (rating === RATINGS.EASY) {
      // ข้าม learning ไปเลย — คำใหม่ได้ 4 วัน, คำที่ลืมกลับไปเริ่ม 1 วัน
      const days = s.status === 'relearning'
        ? SM2.GRADUATE_INTERVAL
        : SM2.EASY_GRADUATE_INTERVAL;
      return graduate(s, days);
    }

    if (rating === RATINGS.AGAIN) {
      // กลับไป step แรก
      return {
        ...s,
        status: nextStatus,
        learningStep: 0,
        dueAt: minutesFromNow(steps[0]),
      };
    }

    if (rating === RATINGS.HARD) {
      // ค้าง step เดิม แต่รอสั้นกว่า step ปกติเล็กน้อย
      return {
        ...s,
        status: nextStatus,
        dueAt: minutesFromNow(SM2.HARD_LEARNING_MINUTES),
      };
    }

    // GOOD → เดินหน้าทีละ step
    const nextStep = s.learningStep + 1;
    if (nextStep >= steps.length) {
      return graduate(s, SM2.GRADUATE_INTERVAL);
    }
    return {
      ...s,
      status: nextStatus,
      learningStep: nextStep,
      dueAt: minutesFromNow(steps[nextStep]),
    };
  }

  // === review ปกติ ===
  if (rating === RATINGS.AGAIN) {
    const steps = SM2.RELEARNING_STEPS_MINUTES;
    return {
      ...s,
      status: 'relearning',
      learningStep: 0,
      ease: clampEase(s.ease + SM2.EASE_AGAIN_DELTA),
      dueAt: minutesFromNow(steps[0]),
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
      dueAt: null,
      nextReview: addDays(todayISO(), newInterval),
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
      dueAt: null,
      nextReview: addDays(todayISO(), newInterval),
    };
  }

  // GOOD
  const newInterval = capInterval(Math.max(s.interval * s.ease, s.interval + 1));
  return {
    ...s,
    interval: newInterval,
    dueAt: null,
    nextReview: addDays(todayISO(), newInterval),
  };
}

// card อยู่ในขั้นเรียน (นับเป็นนาที) หรือไม่
export function isLearningCard(stat) {
  return stat.status === 'learning' || stat.status === 'relearning';
}

// ถึงเวลาโผล่อีกครั้งหรือยัง (สำหรับคำในขั้นเรียน)
export function isLearningCardReady(stat, now = Date.now()) {
  return (stat.dueAt ?? 0) <= now;
}

// card นี้ due วันนี้ไหม (ระดับวัน)
export function isCardDue(stat) {
  if (stat.status === 'new') return true;
  if (isLearningCard(stat)) return true;
  if (!stat.nextReview) return true;
  return stat.nextReview <= todayISO();
}

function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} นาที`;
  const hours = Math.round(minutes / 60);
  return `${hours} ชม.`;
}

// ข้อความ preview ใต้ปุ่ม (เหมือน Anki บอกว่ากดแล้วจะเจออีกทีเมื่อไหร่)
export function getIntervalPreview(stat, rating) {
  const result = rateCard(stat, rating);
  if (isLearningCard(result)) {
    const remainingMs = (result.dueAt ?? Date.now()) - Date.now();
    return formatMinutes(Math.max(1, Math.round(remainingMs / MS_PER_MINUTE)));
  }
  return `${result.interval} วัน`;
}

// จำนวน step ทั้งหมดของคำนี้ (ใช้แสดงผล เช่น 1/2)
export function totalStepsFor(stat) {
  return stepsFor(stat.status).length;
}
