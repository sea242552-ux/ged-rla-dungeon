import { useState, useEffect, useCallback, useRef } from 'react';
import * as storage from '../data/storage';
import { uploadProgress, downloadProgress } from '../lib/supabase';

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

  // helper: เอา cloud มาทับ local
  const applyCloudData = (cloudWordStats, cloudPlayerStats) => {
    const ws = cloudWordStats || {};
    const ps = { ...storage.getPlayerStats(), ...(cloudPlayerStats || {}) };
    storage.saveWordStats(ws);
    storage.savePlayerStats(ps);
    setWordStats(ws);
    setPlayerStats(ps);
  };

  // เมื่อ user login → ถ้า cloud มีข้อมูล ใช้ cloud, ถ้าไม่มี upload local
  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null;
      return;
    }
    if (lastUserIdRef.current === user.id) return;
    lastUserIdRef.current = user.id;

    async function sync() {
      setSyncing(true);
      const { data } = await downloadProgress(user.id);
      const cloudHasData = data && data.word_stats && Object.keys(data.word_stats).length > 0;

      if (cloudHasData) {
        // มีข้อมูล cloud → ใช้ cloud
        applyCloudData(data.word_stats, data.player_stats);
      } else {
        // ครั้งแรก → upload local ขึ้น cloud
        await uploadProgress(user.id, storage.getWordStats(), storage.getPlayerStats());
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

  // อัพโหลด local ขึ้น cloud (เรียกตอนออกจากเกม / logout)
  const syncToCloud = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    await uploadProgress(user.id, storage.getWordStats(), storage.getPlayerStats());
    setSyncing(false);
  }, [user]);

  // ดึง cloud มาทับ local — เผื่อมี update จากเครื่องอื่น
  const pullFromCloud = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    const { data } = await downloadProgress(user.id);
    if (data && data.word_stats) {
      applyCloudData(data.word_stats, data.player_stats);
    }
    setSyncing(false);
  }, [user]);

  // tab/app กลับมา visible → pull cloud
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
