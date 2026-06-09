import { RANK_INFO } from '../config/constants';

export function getRankFromStat(stat) {
  if (!stat) return RANK_INFO.new;

  if (stat.status === 'new' || stat.status === 'learning') {
    return RANK_INFO.new;
  }

  if (stat.status === 'mastered') {
    return RANK_INFO.mastered;
  }

  // review หรือ relearning
  const intervalKey = stat.interval;
  return RANK_INFO[intervalKey] || RANK_INFO.new;
}

export function getRankFromInterval(intervalKey) {
  return RANK_INFO[intervalKey] || RANK_INFO.new;
}
