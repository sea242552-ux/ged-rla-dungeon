export function toggleFastTrack(stat) {
  return { ...stat, fastTrack: !stat.fastTrack };
}

export function countFastTrack(wordStats) {
  return Object.values(wordStats).filter(s => s.fastTrack).length;
}
