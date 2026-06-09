import { useState, useCallback } from 'react';
import { GAME, SCORES, COMBO_MULTIPLIERS } from '../config/constants';

export function useGameState() {
  const [hp, setHp] = useState(GAME.MAX_HP);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [room, setRoom] = useState(1);
  const [floor, setFloor] = useState(1);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const isBossRoom = room === GAME.ROOMS_PER_FLOOR;

  const getMultiplier = (comboValue) => {
    for (const rule of COMBO_MULTIPLIERS) {
      if (comboValue >= rule.threshold) return rule.multiplier;
    }
    return 1.0;
  };

  const calculateScore = useCallback((interval) => {
    const intervalKey = interval === 'mastered' ? 'mastered' : (interval || 'new');
    const base = SCORES[intervalKey] ?? SCORES.new;
    const newCombo = combo + 1;
    const mult = getMultiplier(newCombo);
    return Math.round(base * mult);
  }, [combo]);

  const handleCorrect = useCallback((interval) => {
    const earned = calculateScore(interval);
    setScore(s => s + earned);
    setCombo(c => c + 1);
    setWordsLearned(w => w + 1);
    return earned;
  }, [calculateScore]);

  const handleIncorrect = useCallback((word) => {
    setHp(h => {
      const newHp = h - 1;
      if (newHp <= 0) setGameOver(true);
      return newHp;
    });
    setCombo(0);
    setWrongAnswers(prev => [...prev, word]);
  }, []);

  const nextRoom = useCallback(() => {
    setRoom(r => {
      if (r >= GAME.ROOMS_PER_FLOOR) {
        setFloor(f => f + 1);
        return 1;
      }
      return r + 1;
    });
  }, []);

  const reset = useCallback(() => {
    setHp(GAME.MAX_HP);
    setScore(0);
    setCombo(0);
    setRoom(1);
    setFloor(1);
    setWordsLearned(0);
    setWrongAnswers([]);
    setGameOver(false);
  }, []);

  return {
    hp, score, combo, room, floor, wordsLearned, wrongAnswers, gameOver,
    isBossRoom,
    handleCorrect,
    handleIncorrect,
    nextRoom,
    reset,
    multiplier: getMultiplier(combo),
  };
}
