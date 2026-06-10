import { GAME } from '../config/constants';
import { calculateWeight, isDue } from './srs';
import { sortByPriority, selectBossWord } from './priority';

function combine(words, wordStats, getStat) {
  return words.map(w => ({ word: w, stat: getStat(w.id) }));
}

function weightedRandom(items, getWeight) {
  const weights = items.map(getWeight);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight <= 0) return items[Math.floor(Math.random() * items.length)];

  let r = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function selectNextWord(words, wordStats, getStat, recentWordIds = []) {
  const all = combine(words, wordStats, getStat);

  const fastTrackPool = all.filter(({ stat }) => stat.fastTrack);

  const duePool = all.filter(({ stat }) =>
    !stat.fastTrack &&
    stat.status !== 'new' &&
    stat.status !== 'mastered' &&
    isDue(stat)
  );

  const newPool = all.filter(({ stat }) => stat.status === 'new');

  const eligiblePool = [...fastTrackPool, ...duePool, ...newPool];

  if (eligiblePool.length === 0) return null;

  const sorted = sortByPriority(eligiblePool);
  // shuffle คำที่มี weight เท่ากัน เพื่อป้องกัน deterministic ordering
  const shuffled = [...sorted].sort((a, b) => {
    const wa = calculateWeight(a.stat);
    const wb = calculateWeight(b.stat);
    if (Math.abs(wa - wb) < 0.01) return Math.random() - 0.5;
    return wb - wa;
  });
  const topN = shuffled.slice(0, Math.min(15, shuffled.length));

  const filtered = topN.filter(({ word }) => !recentWordIds.includes(word.id));
  const pool = filtered.length > 0 ? filtered : topN;

  return weightedRandom(pool, ({ stat }) => calculateWeight(stat));
}

export function generateChoices(targetWord, allWords) {
  const correct = targetWord.meaning;
  const candidates = allWords
    .filter(w => w.id !== targetWord.id && w.meaning !== correct)
    .map(w => w.meaning);

  const uniqueCandidates = [...new Set(candidates)];

  const shuffled = [...uniqueCandidates].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, GAME.CHOICES_COUNT - 1);

  const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);

  return {
    choices,
    correctIndex: choices.indexOf(correct),
  };
}


export function selectBossWordFromAll(words, wordStats, getStat) {
  const combined = words.map(w => ({ word: w, stat: getStat(w.id) }));
  return selectBossWord(combined);
}
