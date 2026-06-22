import { INTERVALS, LEARNING_STEPS, WEIGHTS } from '../config/constants';
import { todayISO, addDays, daysBetween } from '../data/storage';

export function onCorrect(stat) {
  const now = todayISO();
  const newStat = { ...stat, lastSeen: now };

  if (stat.status === 'new' || stat.status === 'learning') {
    const newCount = stat.learningCount + 1;
    if (newCount >= LEARNING_STEPS) {
      return {
        ...newStat,
        status: 'review',
        interval: 1,
        learningCount: 0,
        nextReview: addDays(now, 1),
      };
    }
    return { ...newStat, status: 'learning', learningCount: newCount };
  }

  if (stat.status === 'relearning') {
    return {
      ...newStat,
      status: 'review',
      learningCount: 0,
      nextReview: addDays(now, stat.interval || 1),
    };
  }

  if (stat.status === 'review') {
    const currentIdx = INTERVALS.indexOf(stat.interval);
    if (currentIdx === -1) {
      return { ...newStat, interval: 1, nextReview: addDays(now, 1) };
    }
    if (currentIdx === INTERVALS.length - 1) {
      return {
        ...newStat,
        status: 'mastered',
        interval: 'mastered',
        nextReview: null,
        fastTrack: false,
      };
    }
    const nextInterval = INTERVALS[currentIdx + 1];
    return {
      ...newStat,
      interval: nextInterval,
      nextReview: addDays(now, nextInterval),
      fastTrack: false,
    };
  }

  if (stat.status === 'mastered') {
    return { ...newStat };
  }

  return newStat;
}

export function onIncorrect(stat) {
  const now = todayISO();
  const newStat = { ...stat, lastSeen: now, fastTrack: false };

  if (stat.status === 'new' || stat.status === 'learning') {
    return { ...newStat, status: 'learning', learningCount: 0 };
  }

  return {
    ...newStat,
    status: 'relearning',
    interval: 1,
    learningCount: 0,
    nextReview: addDays(now, 1),
  };
}

export function calculateWeight(stat) {
  if (stat.status === 'new') return WEIGHTS.new;
  if (stat.status === 'learning') {
    if (stat.learningCount === 1) return WEIGHTS.learning_1;
    if (stat.learningCount === 2) return WEIGHTS.learning_2;
    return WEIGHTS.learning_0;
  }
  if (stat.status === 'relearning') return WEIGHTS.relearning;
  if (stat.status === 'mastered') return WEIGHTS.mastered;
  if (stat.status === 'review') {
    const today = todayISO();
    const overdue = daysBetween(stat.nextReview, today);
    if (overdue <= 0) return WEIGHTS.review_due;
    return WEIGHTS.review_due + WEIGHTS.review_overdue_multiplier * overdue;
  }
  return WEIGHTS.new;
}

export function isDue(stat) {
  if (stat.status === 'new' || stat.status === 'learning') return true;
  if (stat.status === 'mastered') return false;
  if (!stat.nextReview) return true;
  return daysBetween(stat.nextReview, todayISO()) >= 0;
}
