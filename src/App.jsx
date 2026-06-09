import { useProgress } from './hooks/useProgress';
import { onCorrect, onIncorrect, calculateWeight } from './engine/srs';
import { calculateNewCardsAllowed } from './engine/newCardGate';
import { createDefaultStat } from './data/storage';

function App() {
  const { words, wordStats, loading } = useProgress();
  if (loading) return <div className="p-4">Loading...</div>;

  const test = () => {
    let stat = createDefaultStat();
    console.log('Initial:', stat);

    stat = onCorrect(stat); console.log('After correct 1:', stat);
    stat = onCorrect(stat); console.log('After correct 2:', stat);
    stat = onCorrect(stat); console.log('After correct 3 (should be review):', stat);
    stat = onCorrect(stat); console.log('After correct 4 (interval 3):', stat);
    stat = onIncorrect(stat); console.log('After incorrect (should be relearning):', stat);
    stat = onCorrect(stat); console.log('After correct (back to review):', stat);

    console.log('Weight:', calculateWeight(stat));
    console.log('New cards allowed:', calculateNewCardsAllowed(wordStats));
  };

  return (
    <div className="p-4 font-mono text-sm">
      <h1 className="text-xl mb-4">⚔️ SRS Engine Test</h1>
      <button
        onClick={test}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded"
      >
        Run SRS Test (เปิด console)
      </button>
      <p className="mt-4 text-zinc-400">Words: {words.length}</p>
    </div>
  );
}

export default App;
