import { SupabaseClient } from '@supabase/supabase-js';

export async function updateStreak(supabase: SupabaseClient, userId: string) {
  const { data: userData } = await supabase
    .from('users')
    .select('streak_count, last_active')
    .eq('id', userId)
    .single();

  if (!userData) return;

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const lastActive = userData.last_active
    ? new Date(userData.last_active).toISOString().split('T')[0]
    : null;

  let newStreak = 1;

  if (lastActive === today) {
    // Already active today, keep streak
    newStreak = userData.streak_count || 1;
  } else if (lastActive) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      // Was active yesterday, increment
      newStreak = (userData.streak_count || 0) + 1;
    }
    // else: gap of 2+ days, reset to 1
  }

  await supabase
    .from('users')
    .update({ streak_count: newStreak, last_active: now.toISOString() })
    .eq('id', userId);

  return newStreak;
}
