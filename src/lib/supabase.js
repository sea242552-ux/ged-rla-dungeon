import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ========== Auth ==========
export async function signUp(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

export function getDisplayName(user) {
  if (!user) return null;
  return user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player';
}

// ========== Progress Sync ==========
// "ก้าวหน้า" = จำนวนคำที่ status ไม่ใช่ 'new'
export function calculateProgressScore(wordStats) {
  if (!wordStats) return 0;
  return Object.values(wordStats).filter(s => s && s.status && s.status !== 'new').length;
}

export async function uploadProgress(userId, wordStats, playerStats) {
  const { error } = await supabase.from('user_data').upsert({
    user_id: userId,
    word_stats: wordStats,
    player_stats: playerStats,
    source: 'ged_rla',
    updated_at: new Date().toISOString(),
  });
  return { error };
}

export async function downloadProgress(userId) {
  const { data, error } = await supabase
    .from('user_data')
    .select('word_stats, player_stats')
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
}

// ========== Leaderboard ==========
export async function submitScore({ name, score, floor, wordsLearned }) {
  const { error } = await supabase.from('leaderboard').insert({
    name,
    score,
    floor,
    words_learned: wordsLearned,
    source: 'ged_rla',
  });
  return { error };
}

export async function fetchOnlineLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('name, score, floor, words_learned, created_at')
    .eq('source', 'ged_rla')
    .order('score', { ascending: false })
    .limit(10);
  return { data, error };
}
