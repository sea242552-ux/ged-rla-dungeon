import { getRankFromStat } from '../engine/rank';

export default function WordChip({ word, stat, onClick }) {
  const rank = getRankFromStat(stat);
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded text-left"
    >
      <div className="flex items-center gap-2">
        {rank.icon && <span className="text-xs">{rank.icon}</span>}
        <span className={`font-mono ${rank.color}`}>{word.word}</span>
        {stat.fastTrack && <span className="text-amber-400 text-xs">⚡</span>}
      </div>
      <span className="text-xs text-zinc-500">{word.meaning}</span>
    </button>
  );
}
