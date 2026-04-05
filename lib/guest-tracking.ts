import { createClient } from '@/utils/supabase/client';

// In-memory cache to avoid repeated DB lookups within the same session
let _isGuestCached: boolean | null = null;
let _cachedUserId: string | null = null;

/**
 * Check if the current authenticated user is a guest (anonymous).
 * Result is cached for the session to avoid repeated DB roundtrips.
 */
export async function isCurrentUserGuest(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // If we already checked for this user, return cached result
    if (_cachedUserId === user.id && _isGuestCached !== null) {
      return _isGuestCached;
    }

    // Fast path: Supabase marks anonymous users
    if (user.is_anonymous) {
      _cachedUserId = user.id;
      _isGuestCached = true;
      return true;
    }

    // Fallback: check DB
    const { data: profile } = await supabase
      .from('users')
      .select('is_guest')
      .eq('id', user.id)
      .single();

    _cachedUserId = user.id;
    _isGuestCached = profile?.is_guest ?? false;
    return _isGuestCached;
  } catch {
    return false;
  }
}

/**
 * Clear the guest cache (call on logout or auth state change)
 */
export function clearGuestCache() {
  _isGuestCached = null;
  _cachedUserId = null;
}

/**
 * Track a guest user's activity. No-op for non-guest users.
 * @param action  - e.g. 'page_view', 'question_viewed', 'bookmark_attempted'
 * @param page    - e.g. 'dashboard', 'question_bank', 'analytics'
 * @param metadata - optional JSON payload (question_id, company, etc.)
 */
export async function trackGuestActivity(
  action: string,
  page: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isGuest = await isCurrentUserGuest();
    if (!isGuest) return;

    await supabase.from('guest_activity').insert({
      guest_user_id: user.id,
      action,
      page,
      metadata,
    });
  } catch {
    // Silently fail — tracking should never block UX
  }
}
