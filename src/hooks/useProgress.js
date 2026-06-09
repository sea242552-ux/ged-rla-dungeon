import { useState, useEffect, useCallback } from 'react';
import * as storage from '../data/storage';

export function useProgress() {
  const [words, setWords] = useState([]);
  const [wordStats, setWordStats] = useState({});
  const [playerStats, setPlayerStats] = useState(storage.getPlayerStats());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/words.json');
        const data = await res.json();
        setWords(data);
        setWordStats(storage.getWordStats());
      } catch (e) {
        console.error('Failed to load words:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStat = useCallback((wordId) => {
    return wordStats[wordId] || storage.createDefaultStat();
  }, [wordStats]);

  const updateStat = useCallback((wordId, updates) => {
    setWordStats(prev => {
      const current = prev[wordId] || storage.createDefaultStat();
      const next = { ...prev, [wordId]: { ...current, ...updates } };
      storage.saveWordStats(next);
      return next;
    });
  }, []);

  const updatePlayer = useCallback((updates) => {
    setPlayerStats(prev => {
      const next = { ...prev, ...updates };
      storage.savePlayerStats(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    storage.resetAllProgress();
    setWordStats({});
    setPlayerStats(storage.getPlayerStats());
  }, []);

  return {
    words,
    wordStats,
    playerStats,
    loading,
    getStat,
    updateStat,
    updatePlayer,
    resetAll,
  };
}
