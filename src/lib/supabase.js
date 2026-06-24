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
