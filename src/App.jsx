import { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import GameScreen from './components/GameScreen';

function App() {
  const progress = useProgress();
  const [screen, setScreen] = useState('home');  // 'home' | 'game' | 'gameover'
  const [gameResult, setGameResult] = useState(null);

  if (progress.loading) return <div className="p-4">Loading...</div>;

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

  if (screen === 'gameover') {
    return (
      <div className="min-h-screen p-4 font-mono">
        <h2 className="text-2xl mb-4">Game Over</h2>
        <pre className="text-xs">{JSON.stringify(gameResult, null, 2)}</pre>
        <button
          onClick={() => setScreen('home')}
          className="mt-4 px-4 py-2 bg-zinc-800 rounded"
        >
          กลับหน้าแรก
        </button>
      </div>
    );
  }

  // Home (placeholder)
  return (
    <div className="min-h-screen p-4 font-mono flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-8">⚔️ GED RLA Dungeon</h1>
      <button
        onClick={() => setScreen('game')}
        className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded text-lg"
      >
        Start Game
      </button>
    </div>
  );
}

export default App;
