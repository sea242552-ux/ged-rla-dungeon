import { useState, useCallback } from 'react';
import { FLASHCARD_LIMITS } from '../config/constants';
import { RATINGS, rateCard, getIntervalPreview, totalStepsFor } from '../engine/sm2';
import { selectNextFlashcard, countRemainingBeyondLimit } from '../engine/flashcardSelector';
import {
  getFlashcardStats, updateFlashcardStat,
  getFlashcardSettings, saveFlashcardSettings,
  getFlashcardDaily, trackDailyCard,
} from '../data/flashcardStorage';
import { speak } from '../utils/speech';

const RATING_BUTTONS = [
  { rating: RATINGS.AGAIN, label: 'Again', color: 'bg-red-800 hover:bg-red-700' },
  { rating: RATINGS.HARD,  label: 'Hard',  color: 'bg-orange-800 hover:bg-orange-700' },
  { rating: RATINGS.GOOD,  label: 'Good',  color: 'bg-green-800 hover:bg-green-700' },
  { rating: RATINGS.EASY,  label: 'Easy',  color: 'bg-sky-800 hover:bg-sky-700' },
];

export default function FlashcardMode({ words, onExit }) {
  const [stats, setStats] = useState(getFlashcardStats);
  const [settings, setSettings] = useState(getFlashcardSettings);
  const [daily, setDaily] = useState(getFlashcardDaily);
  const [continueMode, setContinueMode] = useState(false);
  const [current, setCurrent] = useState(() =>
    selectNextFlashcard(words, getFlashcardStats(), getFlashcardDaily(), getFlashcardSettings())
  );
  const [revealed, setRevealed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const pickNext = useCallback((newStats, newDaily, isContinue, excludeId) => {
    const next = selectNextFlashcard(words, newStats, newDaily, settings, isContinue, excludeId);
    setCurrent(next);
    setRevealed(false);
  }, [words, settings]);

  const handleRate = (rating) => {
    if (!current) return;
    const prevStatus = current.stat.status;
    const newStat = rateCard(current.stat, rating);
    const newStats = updateFlashcardStat(current.word.id, newStat);
    const newDaily = trackDailyCard(current.word.id, prevStatus);
    setStats(newStats);
    setDaily(newDaily);
    pickNext(newStats, newDaily, continueMode, current.word.id);
  };

  const handleContinue = () => {
    setContinueMode(true);
    pickNext(stats, daily, true, null);
  };

  const adjustSetting = (field, delta, max) => {
    const next = {
      ...settings,
      [field]: Math.max(0, Math.min(max, settings[field] + delta)),
    };
    setSettings(next);
    saveFlashcardSettings(next);
    // โควต้าเปลี่ยน → เลือกคำใหม่ทันที
    const nextCard = selectNextFlashcard(words, stats, daily, next, continueMode, null);
    setCurrent(nextCard);
    setRevealed(false);
  };

  const remainingBeyond = countRemainingBeyondLimit(words, stats, daily, settings);

  // === หน้าหมดคำของวันนี้ ===
  if (!current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-5xl mb-4">🎉</div>
        <div className="text-xl text-white mb-2">
          {continueMode ? 'หมดคำที่ต้องทบทวนวันนี้แล้ว' : 'หมดคำของวันนี้แล้ว'}
        </div>
        <div className="text-sm text-zinc-400 mb-2 text-center">
          ใหม่ {daily.newSeen.length}/{settings.newPerDay} · ทบทวน {daily.reviewsSeen.length}/{settings.reviewsPerDay}
        </div>
        {!continueMode && remainingBeyond > 0 && (
          <div className="text-xs text-zinc-500 mb-6 text-center">
            ยังมีคำที่ถึงกำหนดวันนี้อีก {remainingBeyond} คำ (เกินโควต้า)
          </div>
        )}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
          {!continueMode && remainingBeyond > 0 && (
            <button
              onClick={handleContinue}
              className="p-3 bg-amber-700 hover:bg-amber-600 rounded text-white"
            >
              เล่นต่อ (ทบทวนเพิ่ม {remainingBeyond} คำ)
            </button>
          )}
          <button
            onClick={onExit}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  const { word, stat } = current;

  return (
    <div className="min-h-screen flex flex-col p-4 font-mono">

      {/* === TOP BAR === */}
      <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
        <button onClick={onExit} className="hover:text-white">← ออก</button>
        <div>🃏 Flashcard</div>
        <button onClick={() => setShowSettings(s => !s)} className="hover:text-white text-base">⚙</button>
      </div>

      {/* === COUNTERS === */}
      <div className="text-center text-xs text-zinc-500 mb-4">
        ใหม่ <span className="text-blue-400">{daily.newSeen.length}/{settings.newPerDay}</span>
        {' · '}
        ทบทวน <span className="text-green-400">{daily.reviewsSeen.length}/{settings.reviewsPerDay}</span>
        {continueMode && <span className="text-amber-400 ml-2">(โหมดเล่นต่อ)</span>}
      </div>

      {/* === SETTINGS PANEL === */}
      {showSettings && (
        <div className="bg-zinc-900 rounded-lg p-3 mb-4">
          <div className="text-xs text-zinc-500 mb-2">จำกัดต่อวัน</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-zinc-400 mb-1">คำใหม่</div>
              <div className="flex items-center justify-between bg-zinc-950 rounded px-2 py-1">
                <button
                  onClick={() => adjustSetting('newPerDay', -FLASHCARD_LIMITS.STEP, FLASHCARD_LIMITS.NEW_MAX)}
                  className="text-zinc-400 hover:text-white px-2"
                >−</button>
                <span className="text-sm text-white">{settings.newPerDay}</span>
                <button
                  onClick={() => adjustSetting('newPerDay', FLASHCARD_LIMITS.STEP, FLASHCARD_LIMITS.NEW_MAX)}
                  className="text-zinc-400 hover:text-white px-2"
                >+</button>
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">คำทบทวน</div>
              <div className="flex items-center justify-between bg-zinc-950 rounded px-2 py-1">
                <button
                  onClick={() => adjustSetting('reviewsPerDay', -FLASHCARD_LIMITS.STEP, FLASHCARD_LIMITS.REVIEWS_MAX)}
                  className="text-zinc-400 hover:text-white px-2"
                >−</button>
                <span className="text-sm text-white">{settings.reviewsPerDay}</span>
                <button
                  onClick={() => adjustSetting('reviewsPerDay', FLASHCARD_LIMITS.STEP, FLASHCARD_LIMITS.REVIEWS_MAX)}
                  className="text-zinc-400 hover:text-white px-2"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === CARD === */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-xs text-zinc-600 mb-3">
          {stat.status === 'new' && '🆕 คำใหม่'}
          {stat.status === 'learning' && `📖 กำลังเรียน (${stat.learningStep + 1}/${totalStepsFor(stat)})`}
          {stat.status === 'relearning' && '🔁 เรียนซ้ำ'}
          {stat.status === 'review' && `📅 ทบทวน (${stat.interval} วัน)`}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="text-4xl text-white text-center">{word.word}</div>
          <button
            onClick={() => speak(word.word)}
            className="text-xl text-zinc-500 hover:text-white"
            title="ออกเสียง"
          >
            🔉
          </button>
        </div>

        {revealed ? (
          <>
            {/* === คำตอบ === */}
            <div className="border-t border-zinc-700 w-full max-w-md pt-6 mb-4 text-center">
              <div className="text-2xl text-amber-400 mb-4">{word.meaning}</div>
              <div className="text-xs italic text-zinc-500 max-w-md">
                {word.examples[0]}
              </div>
            </div>

            {/* === 4 ปุ่มประเมิน === */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-md mt-4">
              {RATING_BUTTONS.map(({ rating, label, color }) => (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  className={`p-3 rounded ${color} text-white flex flex-col items-center`}
                >
                  <span className="text-sm">{label}</span>
                  <span className="text-[10px] text-white/60 mt-1">
                    {getIntervalPreview(stat, rating)}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="w-full max-w-md p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-lg"
          >
            แสดงคำตอบ
          </button>
        )}
      </div>
    </div>
  );
}
