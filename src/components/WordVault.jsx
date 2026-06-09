import { useState, useMemo } from 'react';
import { RANK_INFO } from '../config/constants';
import { getRankFromStat, getRankFromInterval } from '../engine/rank';
import { toggleFastTrack } from '../engine/fastTrack';

export default function WordVault({ words, wordStats, getStat, updateStat, onBack }) {
  const [selectedRank, setSelectedRank] = useState(null);  // null = ดูทั้งหมด

  const grouped = useMemo(() => {
    const groups = { new: [], 1: [], 3: [], 7: [], 14: [], 30: [], mastered: [] };
    for (const w of words) {
      const stat = getStat(w.id);
      if (stat.status === 'new' || stat.status === 'learning') {
        groups.new.push({ word: w, stat });
      } else if (stat.status === 'mastered') {
        groups.mastered.push({ word: w, stat });
      } else if (typeof stat.interval === 'number' && groups[stat.interval]) {
        groups[stat.interval].push({ word: w, stat });
      } else {
        groups.new.push({ word: w, stat });  // fallback
      }
    }
    return groups;
  }, [words, wordStats, getStat]);

  const rankKeys = ['new', 1, 3, 7, 14, 30, 'mastered'];

  const handleToggleFastTrack = (wordId, stat) => {
    const updated = toggleFastTrack(stat);
    updateStat(wordId, updated);
  };

  const displayedGroups = selectedRank !== null
    ? { [selectedRank]: grouped[selectedRank] }
    : grouped;

  return (
    <div className="min-h-screen p-4 font-mono">
      <div className="max-w-md mx-auto">
        {/* === HEADER === */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-white">← Back</button>
          <h2 className="text-lg">📚 Word Vault</h2>
          <div className="w-12" />
        </div>

        {/* === FILTER PILLS === */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedRank(null)}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${selectedRank === null ? 'bg-zinc-700' : 'bg-zinc-900'}`}
          >
            All ({words.length})
          </button>
          {rankKeys.map(key => {
            const info = getRankFromInterval(key);
            const count = grouped[key].length;
            return (
              <button
                key={key}
                onClick={() => setSelectedRank(key)}
                className={`px-3 py-1 rounded text-xs whitespace-nowrap ${selectedRank === key ? 'bg-zinc-700' : 'bg-zinc-900'} ${info.color}`}
              >
                {info.icon || ''} {info.label} ({count})
              </button>
            );
          })}
        </div>

        {/* === WORD LIST === */}
        <div className="space-y-4">
          {rankKeys.map(key => {
            const group = displayedGroups[key];
            if (!group || group.length === 0) return null;
            const info = getRankFromInterval(key);

            return (
              <div key={key}>
                <div className={`text-xs ${info.color} mb-2 flex items-center gap-2`}>
                  {info.icon} {info.label} ({group.length})
                </div>
                <div className="space-y-1">
                  {group.map(({ word, stat }) => {
                    const rank = getRankFromStat(stat);
                    return (
                      <div key={word.id} className="bg-zinc-900 rounded p-2 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono ${rank.color}`}>{word.word}</span>
                            {stat.fastTrack && <span className="text-amber-400 text-xs">⚡</span>}
                          </div>
                          <div className="text-xs text-zinc-500 truncate">{word.meaning}</div>
                        </div>
                        {/* Fast Track toggle — แสดงเฉพาะคำที่ status ไม่ใช่ mastered + not new */}
                        {stat.status !== 'mastered' && stat.status !== 'new' && stat.status !== 'learning' && (
                          <button
                            onClick={() => handleToggleFastTrack(word.id, stat)}
                            className={`ml-2 px-2 py-1 rounded text-xs ${stat.fastTrack ? 'bg-amber-700' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                          >
                            ⚡
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
