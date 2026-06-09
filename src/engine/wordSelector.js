import { GAME } from '../config/constants';
import { calculateWeight, isDue } from './srs';
import { sortByPriority } from './priority';
import { calculateNewCardsAllowed } from './newCardGate';

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

export function selectNextWord(words, wordStats, getStat, newCardsUsed = 0) {
  const all = combine(words, wordStats, getStat);

  const fastTrackPool = all.filter(({ stat }) => stat.fastTrack);

  const duePool = all.filter(({ stat }) =>
    !stat.fastTrack &&
    stat.status !== 'new' &&
    stat.status !== 'mastered' &&
    isDue(stat)
  );

  const newCardsAllowed = calculateNewCardsAllowed(wordStats);
  const remainingNew = Math.max(0, newCardsAllowed - newCardsUsed);
  const newPool = remainingNew > 0
    ? all.filter(({ stat }) => stat.status === 'new')
    : [];

  const eligiblePool = [...fastTrackPool, ...duePool, ...newPool];

  if (eligiblePool.length === 0) return null;

  const sorted = sortByPriority(eligiblePool);
  const topN = sorted.slice(0, Math.min(5, sorted.length));

  return weightedRandom(topN, ({ stat }) => calculateWeight(stat));
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

export function hasWordsToPlay(words, wordStats, getStat) {
  const all = combine(words, wordStats, getStat);

  if (all.some(({ stat }) => stat.fastTrack)) return true;

  if (all.some(({ stat }) =>
    stat.status !== 'new' &&
    stat.status !== 'mastered' &&
    isDue(stat)
  )) return true;

  const allowed = calculateNewCardsAllowed(wordStats);
  if (allowed > 0 && all.some(({ stat }) => stat.status === 'new')) return true;

  return false;
}
