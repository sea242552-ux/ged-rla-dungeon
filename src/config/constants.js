// ========== INTERVAL & LEARNING ==========
export const INTERVALS = [1, 3, 7, 14, 30];  // หลัง 30 = mastered
export const LEARNING_STEPS = 3;       // คำใหม่ต้องถูก 3 ครั้ง
export const RELEARNING_STEPS = 1;     // คำ relearn ต้องถูก 1 ครั้ง

// ========== WEIGHTS (ความน่าจะถูกสุ่มออกมา) ==========
export const WEIGHTS = {
  new: 1.0,
  learning_0: 4.0,        // เพิ่งตอบผิด / เริ่มเรียนรู้ใหม่
  learning_1: 3.0,        // ตอบถูก 1/3
  learning_2: 2.0,        // ตอบถูก 2/3 (ใกล้อัพ)
  review_due: 1.0,        // ถึงกำหนด review พอดี
  review_overdue_multiplier: 0.3,  // 1.0 + (0.3 × overdue_days)
  relearning: 6.0,        // เคย mastered แล้วผิด — สำคัญสุด
  mastered: 0.1,
};

// ========== ANTI-REPEAT (กันคำเดิมโผล่ติดกัน) ==========
export const RECENT_WORDS_BUFFER = 8;

// ========== DAILY LIMITS (จำกัดคำต่อวัน) ==========
export const DAILY_LIMITS = {
  NEW_DEFAULT: 10,
  REVIEW_DEFAULT: 30,
  STEP: 5,
  NEW_MAX: 100,
  REVIEW_MAX: 200,
};

// ========== INTERVAL WEIGHTS (สำหรับ priority calculation) ==========
export const INTERVAL_WEIGHTS = {
  1: 1, 3: 2, 7: 3, 14: 4, 30: 5, mastered: 6
};

// ========== NEW CARD GATE (จำกัดคำใหม่ตาม pressure) ==========
// pressure = due_cards + learning_cards
export const NEW_CARD_GATE = [
  { maxPressure: 5,        newCards: 5 },
  { maxPressure: 10,       newCards: 3 },
  { maxPressure: 20,       newCards: 1 },
  { maxPressure: Infinity, newCards: 0 },
];

// ========== SCORES (คะแนนพื้นฐานตาม interval ของคำ) ==========
export const SCORES = {
  new: 10,        // คำใหม่ / learning
  1: 10,
  3: 20,
  7: 35,
  14: 55,
  30: 80,
  mastered: 120,
};

// ========== COMBO MULTIPLIERS ==========
// ใช้แบบ descending: หา threshold สูงสุดที่ combo >= threshold
export const COMBO_MULTIPLIERS = [
  { threshold: 20, multiplier: 3.0 },
  { threshold: 10, multiplier: 2.0 },
  { threshold: 5,  multiplier: 1.5 },
  { threshold: 2,  multiplier: 1.2 },
  { threshold: 0,  multiplier: 1.0 },
];

// ========== GAME SETTINGS ==========
export const GAME = {
  MAX_HP: 3,
  ROOMS_PER_FLOOR: 10,
  BOSS_HP: 3,
  CHOICES_COUNT: 4,
  BOSS_MIN_INTERVAL: 7,  // คำที่ใช้เป็น boss ต้อง interval >= 7
  EFFECT_DURATION_MS: 1200,
};

// ========== RANK DISPLAY ==========
export const RANK_INFO = {
  new:       { color: 'text-white',        icon: '',     label: 'New' },
  1:         { color: 'text-blue-400',      icon: '',     label: '1 วัน' },
  3:         { color: 'text-green-400',    icon: '🛡️🛡️', label: '3 วัน' },
  7:         { color: 'text-amber-400',    icon: '⚜️',   label: '7 วัน' },
  14:        { color: 'text-orange-500',   icon: '💎',    label: '14 วัน' },
  30:        { color: 'text-red-500',      icon: '🔥',   label: '30 วัน' },
  mastered:  { color: 'text-yellow-300',   icon: '⚔️',   label: 'Mastered' },
};

// ========== FLASHCARD MODE (SM-2 แบบ Anki) ==========
export const SM2 = {
  STARTING_EASE: 2.5,          // ease เริ่มต้นของทุกคำ (250%)
  MIN_EASE: 1.3,               // ease ต่ำสุด (130%)
  EASE_AGAIN_DELTA: -0.20,     // กด Again → ease ลด 20%
  EASE_HARD_DELTA: -0.15,      // กด Hard → ease ลด 15%
  EASE_EASY_DELTA: 0.15,       // กด Easy → ease เพิ่ม 15%
  HARD_INTERVAL_MULTIPLIER: 1.2,  // Hard → interval × 1.2
  EASY_BONUS: 1.3,             // Easy → interval × ease × 1.3
  LEARNING_STEPS: 2,           // คำใหม่ต้องกด Good 2 ครั้งก่อน graduate
  GRADUATE_INTERVAL: 1,        // graduate แล้วเริ่มที่ 1 วัน
  EASY_GRADUATE_INTERVAL: 4,   // กด Easy ระหว่าง learning → ข้ามไป 4 วัน
  MAX_INTERVAL: 365,           // interval สูงสุด (วัน)
};

export const FLASHCARD_LIMITS = {
  NEW_PER_DAY_DEFAULT: 20,     // คำใหม่ต่อวัน (default)
  REVIEWS_PER_DAY_DEFAULT: 100, // คำทบทวนต่อวัน (default)
  STEP: 5,                     // ปรับทีละ 5
  NEW_MAX: 200,
  REVIEWS_MAX: 500,
};

// ========== STORAGE KEYS ==========
export const STORAGE_KEYS = {
  WORD_STATS: 'gedRlaDungeon_wordStats',
  PLAYER_STATS: 'gedRlaDungeon_playerStats',
  LEADERBOARD: 'gedRlaDungeon_leaderboard',
  SPEECH_ENABLED: 'gedRlaDungeon_speechEnabled',
  FLASHCARD_STATS: 'gedRlaDungeon_flashcardStats',
  FLASHCARD_SETTINGS: 'gedRlaDungeon_flashcardSettings',
  FLASHCARD_DAILY: 'gedRlaDungeon_flashcardDaily',
};
