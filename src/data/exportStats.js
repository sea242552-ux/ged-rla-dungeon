import { getWordStats, getPlayerStats } from './storage';

export function exportStatsAsJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    source: 'ged_rla',
    wordStats: getWordStats(),
    playerStats: getPlayerStats(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ged_rla_stats_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
