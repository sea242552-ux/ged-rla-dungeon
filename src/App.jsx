import { useProgress } from './hooks/useProgress';
import { selectNextWord, generateChoices, hasWordsToPlay } from './engine/wordSelector';

function App() {
  const { words, wordStats, loading, getStat } = useProgress();
  if (loading) return <div className="p-4">Loading...</div>;

  const test = () => {
    const selected = selectNextWord(words, wordStats, getStat, 0);
    console.log('Selected word:', selected);

    if (selected) {
      const { choices, correctIndex } = generateChoices(selected.word, words);
      console.log('Choices:', choices);
      console.log('Correct index:', correctIndex);
      console.log('Correct answer:', choices[correctIndex]);
    }

    console.log('Has words to play:', hasWordsToPlay(words, wordStats, getStat));
  };

  return (
    <div className="p-4 font-mono text-sm">
      <h1 className="text-xl mb-4">⚔️ Word Selector Test</h1>
      <button
        onClick={test}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded"
      >
        Pick next word (เปิด console)
      </button>
    </div>
  );
}

export default App;
