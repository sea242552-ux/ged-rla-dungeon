import { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import { useAuth } from './hooks/useAuth';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import WordVault from './components/WordVault';
import GameOverScreen from './components/GameOverScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import AuthScreen from './components/AuthScreen';
import FlashcardMode from './components/FlashcardMode';

function App() {
  const auth = useAuth();
  const progress = useProgress(auth.user);
  const [screen, setScreen] = useState('home');
  const [gameResult, setGameResult] = useState(null);

  if (progress.loading || auth.loading) return <div className="p-4 font-mono">Loading...</div>;

  if (screen === 'auth') {
    return <AuthScreen onBack={() => setScreen('home')} />;
  }

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

  if (screen === 'flashcard') {
    return <FlashcardMode words={progress.words} onExit={() => setScreen('home')} />;
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
        user={auth.user}
        onPlayAgain={() => setScreen('game')}
        onHome={() => setScreen('home')}
      />
    );
  }

  return (
    <HomeScreen
      {...progress}
      user={auth.user}
      onStart={() => setScreen('game')}
      onVault={() => setScreen('vault')}
      onLeaderboard={() => setScreen('leaderboard')}
      onFlashcard={() => setScreen('flashcard')}
      onAuth={() => setScreen('auth')}
      onReset={progress.resetAll}
    />
  );
}

export default App;
