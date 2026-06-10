import { CONNECTOR_TYPES } from '../data/connectors';
import { GAME } from '../config/constants';

const MIN_WEIGHT = 0.1;
const MAX_WEIGHT = 1.0;
const CORRECT_DECAY = 0.3;
const WRONG_BOOST = 0.4;

export function getConnectorWeights() {
  const stored = localStorage.getItem('gedRla_connectorWeights');
  if (stored) return JSON.parse(stored);
  const weights = {};
  for (const [type, data] of Object.entries(CONNECTOR_TYPES)) {
    for (const w of data.words) {
      weights[`${type}:${w.word}`] = MAX_WEIGHT;
    }
  }
  return weights;
}

export function saveConnectorWeights(weights) {
  localStorage.setItem('gedRla_connectorWeights', JSON.stringify(weights));
}

export function updateWeight(weights, type, word, correct) {
  const key = `${type}:${word}`;
  const current = weights[key] ?? MAX_WEIGHT;
  const next = correct
    ? Math.max(MIN_WEIGHT, current - CORRECT_DECAY)
    : Math.min(MAX_WEIGHT, current + WRONG_BOOST);
  return { ...weights, [key]: next };
}

export function pickCorrectAnswer(type, weights) {
  const words = CONNECTOR_TYPES[type]?.words ?? [];
  if (words.length === 0) return null;
  const total = words.reduce((s, w) => s + (weights[`${type}:${w.word}`] ?? MAX_WEIGHT), 0);
  let r = Math.random() * total;
  for (const w of words) {
    r -= weights[`${type}:${w.word}`] ?? MAX_WEIGHT;
    if (r <= 0) return w.word;
  }
  return words[words.length - 1].word;
}

export function pickDistractors(correctType, correctWord, count = 3) {
  const otherTypes = Object.entries(CONNECTOR_TYPES).filter(([t]) => t !== correctType);
  const pool = otherTypes.flatMap(([, data]) => data.words.map(w => w.word));
  const unique = [...new Set(pool)].filter(w => w !== correctWord);
  const shuffled = unique.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateConnectorChoices(type, weights) {
  const correct = pickCorrectAnswer(type, weights);
  if (!correct) return null;
  const distractors = pickDistractors(type, correct);
  const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);
  return { choices, correctAnswers: CONNECTOR_TYPES[type].words.map(w => w.word), correct };
}

export function pickSentence(sentences, type, usedIds = []) {
  const pool = sentences.filter(s => s.type === type && !usedIds.includes(s.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickRandomType() {
  const types = Object.keys(CONNECTOR_TYPES).filter(t => CONNECTOR_TYPES[t].words.length > 0);
  if (types.length === 0) return null;
  return types[Math.floor(Math.random() * types.length)];
}
