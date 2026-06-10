import { useState, useEffect, useCallback } from 'react';
import { CONNECTOR_TYPES } from '../data/connectors';
import { CONNECTOR_SENTENCES } from '../data/connectorSentences';
import { GAME } from '../config/constants';
import {
  getConnectorWeights, saveConnectorWeights, updateWeight,
  generateConnectorChoices, pickSentence, pickRandomType
} from '../engine/connectorEngine';

export default function ConnectorMode({ onExit }) {
  const [hp, setHp] = useState(GAME.MAX_HP);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [weights, setWeights] = useState(getConnectorWeights);
  const [currentSentence, setCurrentSentence] = useState(null);
  const [currentType, setCurrentType] = useState(null);
  const [choices, setChoices] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [feedback, setFeedback] = useState(null);
  const [usedIds, setUsedIds] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [correctWord, setCorrectWord] = useState('');

  const pickNext = useCallback((currentWeights = weights) => {
    const type = pickRandomType();
    if (!type) return;
    const sentence = pickSentence(CONNECTOR_SENTENCES, type, usedIds);
    if (!sentence) {
      setUsedIds([]);
      return;
    }
    const result = generateConnectorChoices(type, currentWeights);
    if (!result) return;
    setCurrentType(type);
    setCurrentSentence(sentence);
    setChoices(result.choices);
    setCorrectAnswers(result.correctAnswers);
    setCorrectWord(result.correct);
    setSelectedIndex(-1);
    setFeedback(null);
    setUsedIds(prev => [...prev, sentence.id]);
  }, [weights, usedIds]);

  useEffect(() => { pickNext(); }, []);

  const handleChoice = (idx) => {
    if (selectedIndex !== -1 || gameOver) return;
    setSelectedIndex(idx);
    const chosen = choices[idx];
    const isCorrect = correctAnswers.includes(chosen);

    if (isCorrect) {
      setScore(s => s + 10 + combo * 2);
      setCombo(c => c + 1);
      setFeedback('correct');
      const newWeights = updateWeight(weights, currentType, chosen, true);
      setWeights(newWeights);
      saveConnectorWeights(newWeights);
      setTimeout(() => pickNext(newWeights), 1500);
    } else {
      const newHp = hp - 1;
      setHp(newHp);
      setCombo(0);
      setFeedback('wrong');
      const newWeights = updateWeight(weights, currentType, chosen, false);
      setWeights(newWeights);
      saveConnectorWeights(newWeights);
      if (newHp <= 0) {
        setGameOver(true);
      }
    }
  };

  const handleNext = () => {
    if (gameOver) return;
    pickNext(weights);
  };

  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-mono">
        <h2 className="text-2xl mb-4">💀 Game Over</h2>
        <div className="bg-zinc-900 rounded-lg p-6 text-center mb-6">
          <div className="text-xs text-zinc-500 mb-1">Score</div>
          <div className="text-4xl mb-4">{score}</div>
        </div>
        <button onClick={onExit} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded">
          กลับหน้าแรก
        </button>
      </div>
    );
  }

  if (!currentSentence) return <div className="p-4 font-mono">Loading...</div>;

  const typeInfo = CONNECTOR_TYPES[currentType];

  return (
    <div className="min-h-screen flex flex-col p-4 font-mono">
      {/* TOP BAR */}
      <div className="flex justify-between text-xs text-zinc-400 mb-4">
        <button onClick={onExit} className="text-zinc-500 hover:text-white">← Exit</button>
        <div>Score: <span className="text-white">{score}</span></div>
      </div>

      {/* HP */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl">
          {'❤️'.repeat(hp)}{'🖤'.repeat(GAME.MAX_HP - hp)}
        </div>
        {combo >= 2 && <div className="text-sm text-amber-400">Combo ×{combo}</div>}
      </div>

      {/* TYPE LABEL */}
      <div className={`text-xs mb-2 ${typeInfo?.color ?? 'text-zinc-400'}`}>
        {typeInfo?.label ?? ''}
      </div>

      {/* SENTENCE */}
      <div className="bg-zinc-900 rounded-lg p-4 mb-6 text-sm leading-relaxed">
        {currentSentence.sentence}
      </div>

      {/* FEEDBACK */}
      {feedback && (
        <div className="text-center text-sm mb-4 h-6">
          {feedback === 'correct' && <span className="text-green-400">✓ ถูกต้อง!</span>}
          {feedback === 'wrong' && <span className="text-red-400">✗ คำตอบที่ใช้ได้: {correctAnswers.join(', ')}</span>}
        </div>
      )}

      {/* CHOICES */}
      <div className="space-y-2 max-w-md w-full mx-auto">
        {choices.map((c, idx) => {
          let bg = 'bg-zinc-800 hover:bg-zinc-700';
          if (feedback) {
            if (correctAnswers.includes(c)) bg = 'bg-green-700';
            else if (idx === selectedIndex) bg = 'bg-red-700';
            else bg = 'bg-zinc-900 text-zinc-500';
          }
          return (
            <button
              key={idx}
              onClick={() => handleChoice(idx)}
              disabled={selectedIndex !== -1}
              className={`w-full p-3 text-left rounded ${bg} transition-colors`}
            >
              {String.fromCharCode(65 + idx)}. {c}
            </button>
          );
        })}
      </div>

      {/* ปุ่มไปต่อ (แสดงเมื่อตอบผิด) */}
      {feedback === 'wrong' && !gameOver && (
        <div className="mt-4 text-center">
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
          >
            ไปต่อ →
          </button>
        </div>
      )}
    </div>
  );
}
