import { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import WordVault from './components/WordVault';

function App() {
  const progress = useProgress();
  const [screen, setScreen] = useState('home');
  const [gameResult, setGameResult] = useState(null);

  if (progress.loading) return <div className="p-4 font-mono">Loading...</div>;

  if (screen === 'game') {
    return (
      <GameScreen
        {...progress}
        onGameOver={(result) => {
          setGameResult(result);
          setScreen('gameover');
        }}
      />
    );
  }

  if (screen === 'vault') {
    return <WordVault {...progress} onBack={() => setScreen('home')} />;
  }

  if (screen === 'leaderboard') {
    return (
      <div className="min-h-screen p-4 font-mono">
        <button onClick={() => setScreen('home')} className="text-zinc-400 mb-4">← Back</button>
        <h2 className="text-lg mb-4">🏆 Leaderboard</h2>
        <p className="text-zinc-500 text-sm">ทำใน Step 10</p>
      </div>
    );
  }

  if (screen === 'gameover') {
    return (
      <div className="min-h-screen p-4 font-mono">
        <h2 className="text-2xl mb-4">Game Over</h2>
        <pre className="text-xs text-zinc-400">{JSON.stringify(gameResult, null, 2)}</pre>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setScreen('game')} className="px-4 py-2 bg-amber-700 rounded">เล่นอีกครั้ง</button>
          <button onClick={() => setScreen('home')} className="px-4 py-2 bg-zinc-800 rounded">กลับหน้าแรก</button>
        </div>
      </div>
    );
  }

  return (
    <HomeScreen
      {...progress}
      onStart={() => setScreen('game')}
      onVault={() => setScreen('vault')}
      onLeaderboard={() => setScreen('leaderboard')}
      onReset={progress.resetAll}
    />
  );
}

export default App;
