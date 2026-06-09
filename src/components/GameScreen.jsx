import { useState, useEffect, useCallback } from 'react';
import { GAME, RANK_INFO } from '../config/constants';
import { useGameState } from '../hooks/useGameState';
import { selectNextWord, generateChoices, hasWordsToPlay } from '../engine/wordSelector';
import { onCorrect, onIncorrect } from '../engine/srs';

export default function GameScreen({ words, wordStats, getStat, updateStat, updatePlayer, playerStats, onGameOver }) {
  const game = useGameState();
  const [currentWord, setCurrentWord] = useState(null);
  const [choices, setChoices] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [feedback, setFeedback] = useState(null);  // 'correct' | 'wrong' | null
  const [newCardsUsed, setNewCardsUsed] = useState(0);
  const [noMoreWords, setNoMoreWords] = useState(false);

  const pickNext = useCallback(() => {
    if (!hasWordsToPlay(words, wordStats, getStat)) {
      setNoMoreWords(true);
      return;
    }
    const next = selectNextWord(words, wordStats, getStat, newCardsUsed);
    if (!next) {
      setNoMoreWords(true);
      return;
    }
    setCurrentWord(next);
    const { choices, correctIndex } = generateChoices(next.word, words);
    setChoices(choices);
    setCorrectIndex(correctIndex);
    setSelectedIndex(-1);
    setFeedback(null);
    if (next.stat.status === 'new') {
      setNewCardsUsed(u => u + 1);
    }
  }, [words, wordStats, getStat, newCardsUsed]);

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
    if (selectedIndex !== -1) return;  // ตอบไปแล้ว
    setSelectedIndex(idx);

    if (idx === correctIndex) {
      const earned = game.handleCorrect(currentWord.stat.interval);
      setFeedback('correct');
      const updated = onCorrect(currentWord.stat);
      updateStat(currentWord.word.id, updated);
    } else {
      game.handleIncorrect(currentWord.word);
      setFeedback('wrong');
      const updated = onIncorrect(currentWord.stat);
      updateStat(currentWord.word.id, updated);
    }

    // หลัง 1.2 วินาที → ไปคำต่อไป
    setTimeout(() => {
      if (game.hp - (idx === correctIndex ? 0 : 1) > 0) {
        game.nextRoom();
        pickNext();
      }
    }, 1200);
  };

  // === No more words ===
  if (noMoreWords) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-mono">
        <div className="text-center max-w-md">
          <h2 className="text-2xl mb-4">🎉 ยินดีด้วย!</h2>
          <p className="text-zinc-300 mb-6">
            คุณได้เรียนรู้คำไปจนหมดของวันนี้แล้ว
          </p>
          <div className="text-sm text-zinc-400 mb-6">
            Score: {game.score} | Floor: {game.floor} | Words: {game.wordsLearned}
          </div>
          <button
            onClick={() => onGameOver({
              score: game.score,
              floor: game.floor,
              wordsLearned: game.wordsLearned,
              wrongAnswers: game.wrongAnswers,
            })}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded"
          >
            จบเกม
          </button>
        </div>
      </div>
    );
  }

  // === Loading ===
  if (!currentWord) {
    return <div className="p-4 font-mono">Loading...</div>;
  }

  // === Rank display ของคำปัจจุบัน ===
  const stat = currentWord.stat;
  const rankKey = stat.status === 'mastered' ? 'mastered'
    : (stat.status === 'new' || stat.status === 'learning') ? 'new'
    : stat.interval;
  const rank = RANK_INFO[rankKey] || RANK_INFO.new;

  return (
    <div className="min-h-screen flex flex-col p-4 font-mono">
      {/* === TOP BAR === */}
      <div className="flex justify-between text-xs text-zinc-400 mb-4">
        <div>Floor {game.floor} — Room {game.room}/{GAME.ROOMS_PER_FLOOR}</div>
        <div>Score: <span className="text-white">{game.score}</span></div>
      </div>

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
          {currentWord.word.example}
        </div>

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
      </div>
    </div>
  );
}
