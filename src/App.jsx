import { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import WordVault from './components/WordVault';
import GameOverScreen from './components/GameOverScreen';
import LeaderboardScreen from './components/LeaderboardScreen';

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
    return <LeaderboardScreen onBack={() => setScreen('home')} />;
  }

  if (screen === 'gameover') {
    return (
      <GameOverScreen
        result={gameResult}
        playerStats={progress.playerStats}
        onPlayAgain={() => setScreen('game')}
        onHome={() => setScreen('home')}
      />
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
