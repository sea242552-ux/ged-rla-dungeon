import { useState, useEffect, useCallback } from 'react';
import { GAME } from '../config/constants';
import { getRankFromStat } from '../engine/rank';
import { useGameState } from '../hooks/useGameState';
import { selectNextWord, generateChoices, selectBossWordFromAll } from '../engine/wordSelector';
import { onCorrect, onIncorrect } from '../engine/srs';

export default function GameScreen({ words, wordStats, getStat, updateStat, updatePlayer, playerStats, onGameOver }) {
  const game = useGameState();
  const [currentWord, setCurrentWord] = useState(null);
  const [choices, setChoices] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [feedback, setFeedback] = useState(null);  // 'correct' | 'wrong' | null
  const [bossHp, setBossHp] = useState(GAME.BOSS_HP);
  const [isInBoss, setIsInBoss] = useState(false);
  const [bossSkipped, setBossSkipped] = useState(false);
  const [example, setExample] = useState('');

  const pickNextNormal = useCallback(() => {
    setIsInBoss(false);
    let next = selectNextWord(words, wordStats, getStat, Infinity);
    if (!next) {
      const fallback = words[Math.floor(Math.random() * words.length)];
      next = { word: fallback, stat: getStat(fallback.id) };
    }
    setCurrentWord(next);
    const { choices, correctIndex } = generateChoices(next.word, words);
    setChoices(choices);
    setCorrectIndex(correctIndex);
    setSelectedIndex(-1);
    setFeedback(null);
    setExample(next.word.examples[Math.floor(Math.random() * next.word.examples.length)]);
  }, [words, wordStats, getStat]);

  const pickNext = useCallback(() => {
    if (game.isBossRoom && !bossSkipped) {
      const boss = selectBossWordFromAll(words, wordStats, getStat);
      if (!boss) {
        // ไม่มีคำระดับสูงพอ → ข้าม Boss
        setBossSkipped(true);
        setTimeout(() => {
          game.nextRoom();
          pickNextNormal();
        }, 1500);
        return;
      }
      setIsInBoss(true);
      setBossHp(GAME.BOSS_HP);
      setCurrentWord(boss);
      const { choices, correctIndex } = generateChoices(boss.word, words);
      setChoices(choices);
      setCorrectIndex(correctIndex);
      setSelectedIndex(-1);
      setFeedback(null);
      setExample(boss.word.examples[Math.floor(Math.random() * boss.word.examples.length)]);
      return;
    }
    pickNextNormal();
  }, [game.isBossRoom, bossSkipped, words, wordStats, getStat, pickNextNormal]);

  // เริ่มเกม: pick คำแรก
  useEffect(() => {
    pickNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เมื่อ HP หมด → game over
  useEffect(() => {
    if (game.gameOver) {
      const newHigh = Math.max(playerStats.highScore, game.score);
      updatePlayer({
        highScore: newHigh,
        totalSeen: playerStats.totalSeen + game.wordsLearned,
      });
      onGameOver({
        score: game.score,
        floor: game.floor,
        wordsLearned: game.wordsLearned,
        wrongAnswers: game.wrongAnswers,
      });
    }
  }, [game.gameOver]);

  const handleChoice = (idx) => {
    if (selectedIndex !== -1) return;
    setSelectedIndex(idx);

    if (isInBoss) {
      // === BOSS LOGIC ===
      if (idx === correctIndex) {
        const earned = game.handleCorrect(currentWord.stat.interval);
        setFeedback('correct');

        // เฉพาะ update lastSeen ของคำ (ไม่อัพ interval)
        updateStat(currentWord.word.id, {
          ...currentWord.stat,
          lastSeen: new Date().toISOString().split('T')[0]
        });

        setBossHp(prev => {
          const newBossHp = prev - 1;
          if (newBossHp <= 0) {
            // Boss ตาย → ไป floor ใหม่
            setTimeout(() => {
              setIsInBoss(false);
              setBossSkipped(false);
              game.nextRoom();
              pickNext();
            }, 1200);
          } else {
            // Boss ยังไม่ตาย → คำใหม่ใน Boss เดียวกัน
            setTimeout(() => {
              const newBoss = selectBossWordFromAll(words, wordStats, getStat);
              if (newBoss) {
                setCurrentWord(newBoss);
                const { choices, correctIndex } = generateChoices(newBoss.word, words);
                setChoices(choices);
                setCorrectIndex(correctIndex);
                setSelectedIndex(-1);
                setFeedback(null);
              }
            }, 1200);
          }
          return newBossHp;
        });
      } else {
        // ผิด → reset คำกลับไป 1 วัน + HP -1
        game.handleIncorrect(currentWord.word);
        setFeedback('wrong');
        const updated = onIncorrect(currentWord.stat);
        updateStat(currentWord.word.id, updated);
      }
      return;
    }

    // === NORMAL LOGIC ===
    if (idx === correctIndex) {
      const earned = game.handleCorrect(currentWord.stat.interval);
      setFeedback('correct');
      const updated = onCorrect(currentWord.stat);
      updateStat(currentWord.word.id, updated);
      setTimeout(() => {
        game.nextRoom();
        pickNext();
      }, 2000);
    } else {
      game.handleIncorrect(currentWord.word);
      setFeedback('wrong');
      const updated = onIncorrect(currentWord.stat);
      updateStat(currentWord.word.id, updated);
    }
  };

  // === Loading ===
  if (!currentWord) {
    return <div className="p-4 font-mono">Loading...</div>;
  }

  // === Rank display ของคำปัจจุบัน ===
  const stat = currentWord.stat;
  const rank = getRankFromStat(stat);

  return (
    <div className="min-h-screen flex flex-col p-4 font-mono">
      {/* === TOP BAR === */}
      <div className="flex justify-between text-xs text-zinc-400 mb-4">
        <div>Floor {game.floor} — Room {game.room}/{GAME.ROOMS_PER_FLOOR}</div>
        <div>Score: <span className="text-white">{game.score}</span></div>
      </div>

      {/* === BOSS BANNER === */}
      {isInBoss && (
        <div className="bg-red-900/30 border border-red-700 rounded p-2 mb-4 text-center">
          <div className="text-red-400 text-sm font-bold">⚔️ BOSS ROOM</div>
          <div className="text-xs text-zinc-400 mt-1">
            Boss HP: {'👹'.repeat(bossHp)}{'💀'.repeat(GAME.BOSS_HP - bossHp)}
          </div>
        </div>
      )}

      {bossSkipped && (
        <div className="bg-zinc-800 rounded p-2 mb-4 text-center text-xs text-zinc-400">
          ยังไม่มีศัตรูแกร่งพอ... ข้าม Boss ห้องนี้
        </div>
      )}

      {/* === HP + COMBO === */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-2xl">
          {'❤️'.repeat(game.hp)}{'🖤'.repeat(GAME.MAX_HP - game.hp)}
        </div>
        {game.combo >= 2 && (
          <div className="text-sm text-amber-400">
            Combo ×{game.combo} ({game.multiplier}x)
          </div>
        )}
      </div>

      {/* === WORD === */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-xs text-zinc-500 mb-2">
          {rank.icon} {rank.label}
        </div>
        <div className={`text-4xl mb-2 ${rank.color}`}>
          {currentWord.word.word}
        </div>
        <div className="text-xs text-zinc-600 italic mb-8 text-center max-w-md">
          {example}
        </div>

        {/* === FEEDBACK TOAST === */}
        {feedback && (
          <div className="text-center text-sm mb-4 h-6">
            {feedback === 'correct' && (
              <span className="text-green-400">✓ ถูกต้อง!</span>
            )}
            {feedback === 'wrong' && (
              <span className="text-red-400">✗ คำตอบที่ถูก: {choices[correctIndex]}</span>
            )}
          </div>
        )}

        {/* === CHOICES === */}
        <div className="w-full max-w-md space-y-2">
          {choices.map((c, idx) => {
            let bg = 'bg-zinc-800 hover:bg-zinc-700';
            if (feedback) {
              if (idx === correctIndex) bg = 'bg-green-700';
              else if (idx === selectedIndex) bg = 'bg-red-700';
              else bg = 'bg-zinc-900 text-zinc-500';
            }
            return (
              <button
                key={idx}
                onClick={() => handleChoice(idx)}
                disabled={selectedIndex !== -1}
                className={`w-full p-3 text-left rounded ${bg} transition-colors`}
              >
                {String.fromCharCode(65 + idx)}. {c}
              </button>
            );
          })}
        </div>

        {/* === ปุ่มไปต่อ (ตอบผิดเท่านั้น) === */}
        {feedback === 'wrong' && (
          <button
            onClick={() => {
              if (isInBoss) {
                const newBoss = selectBossWordFromAll(words, wordStats, getStat);
                if (newBoss) {
                  setCurrentWord(newBoss);
                  const { choices, correctIndex } = generateChoices(newBoss.word, words);
                  setChoices(choices);
                  setCorrectIndex(correctIndex);
                  setSelectedIndex(-1);
                  setFeedback(null);
                }
              } else {
                game.nextRoom();
                pickNext();
              }
            }}
            className="mt-4 px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
          >
            ไปต่อ →
          </button>
        )}
      </div>
    </div>
  );
}
