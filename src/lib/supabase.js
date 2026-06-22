import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
