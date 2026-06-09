import { useProgress } from './hooks/useProgress';

function App() {
  const { words, wordStats, playerStats, loading } = useProgress();

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen p-4 font-mono text-sm">
      <h1 className="text-xl mb-4">⚔️ GED RLA Dungeon — Storage Test</h1>
      <div className="space-y-2 text-zinc-300">
        <p>Words loaded: {words.length}</p>
        <p>Word stats in storage: {Object.keys(wordStats).length}</p>
        <p>High score: {playerStats.highScore}</p>
        <p>Streak: {playerStats.streak}</p>
      </div>
    </div>
  );
}

export default App;
