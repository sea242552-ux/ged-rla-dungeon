import { useState, useEffect, useCallback, useRef } from 'react';
import * as storage from '../data/storage';
import { uploadProgress, downloadProgress, calculateProgressScore } from '../lib/supabase';

export function useProgress(user) {
  const [words, setWords] = useState([]);
  const [wordStats, setWordStats] = useState({});
  const [playerStats, setPlayerStats] = useState(storage.getPlayerStats());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const lastUserIdRef = useRef(null);

  // โหลด words.json ครั้งแรก
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

  // เมื่อ user login เปลี่ยน → sync
  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null;
      return;
    }
    if (lastUserIdRef.current === user.id) return; // sync แล้ว
    lastUserIdRef.current = user.id;

    async function sync() {
      setSyncing(true);
      const localWordStats = storage.getWordStats();
      const localPlayerStats = storage.getPlayerStats();
      const localScore = calculateProgressScore(localWordStats);

      const { data } = await downloadProgress(user.id);
      const cloudWordStats = data?.word_stats || {};
      const cloudPlayerStats = data?.player_stats || {};
      const cloudScore = calculateProgressScore(cloudWordStats);

      if (cloudScore > localScore) {
        // cloud ก้าวหน้ากว่า → ใช้ cloud
        storage.saveWordStats(cloudWordStats);
        storage.savePlayerStats({ ...localPlayerStats, ...cloudPlayerStats });
        setWordStats(cloudWordStats);
        setPlayerStats({ ...localPlayerStats, ...cloudPlayerStats });
      } else if (localScore > cloudScore) {
        // local ก้าวหน้ากว่า → upload
        await uploadProgress(user.id, localWordStats, localPlayerStats);
      } else if (!data) {
        // ยังไม่มีข้อมูล cloud → upload local
        await uploadProgress(user.id, localWordStats, localPlayerStats);
      }
      setSyncing(false);
    }
    sync();
  }, [user]);

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

  // ใช้เรียกตอน Game Over หรือก่อน Logout
  const syncToCloud = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    await uploadProgress(user.id, storage.getWordStats(), storage.getPlayerStats());
    setSyncing(false);
  }, [user]);

  // ดึง cloud มาทับ local — สำหรับเปลี่ยนเครื่องโดยไม่ต้อง logout/login
  const pullFromCloud = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    const { data } = await downloadProgress(user.id);
    if (data) {
      const cloudWordStats = data.word_stats || {};
      const cloudPlayerStats = data.player_stats || {};
      const localScore = calculateProgressScore(storage.getWordStats());
      const cloudScore = calculateProgressScore(cloudWordStats);
      if (cloudScore > localScore) {
        storage.saveWordStats(cloudWordStats);
        storage.savePlayerStats({ ...storage.getPlayerStats(), ...cloudPlayerStats });
        setWordStats(cloudWordStats);
        setPlayerStats({ ...storage.getPlayerStats(), ...cloudPlayerStats });
      }
    }
    setSyncing(false);
  }, [user]);

  // เมื่อ tab/app กลับมา visible → pull cloud
  useEffect(() => {
    if (!user) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') pullFromCloud();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, pullFromCloud]);

  return {
    words,
    wordStats,
    playerStats,
    loading,
    syncing,
    getStat,
    updateStat,
    updatePlayer,
    resetAll,
    syncToCloud,
    pullFromCloud,
  };
}
