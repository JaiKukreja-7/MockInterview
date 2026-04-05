-- =============================================================
-- Guest Mode Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================

-- 1. Add guest columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guest_created_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_page_visited TEXT;

-- 2. Create guest_activity table
CREATE TABLE IF NOT EXISTS guest_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  page TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on guest_activity
ALTER TABLE guest_activity ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Guests can insert their own activity
CREATE POLICY "Users can insert own activity"
  ON guest_activity FOR INSERT
  WITH CHECK (auth.uid() = guest_user_id);

-- Only service role can read activity (for analytics in Supabase dashboard)
CREATE POLICY "Only service role can read activity"
  ON guest_activity FOR SELECT
  USING (false);

-- 5. Allow anonymous users to insert themselves into users table
-- (needed because signInAnonymously creates an auth user but not a users row)
CREATE POLICY "Allow anonymous users to insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================
-- Useful queries for viewing guest data in Supabase Dashboard
-- =============================================================

-- View all guests
-- SELECT * FROM users WHERE is_guest = TRUE ORDER BY guest_created_at DESC;

-- View all guest activity
-- SELECT
--   u.guest_created_at,
--   ga.action,
--   ga.page,
--   ga.metadata,
--   ga.created_at
-- FROM guest_activity ga
-- JOIN users u ON u.id = ga.guest_user_id
-- ORDER BY ga.created_at DESC;

-- Count guests by day
-- SELECT
--   DATE(guest_created_at) as date,
--   COUNT(*) as guest_count
-- FROM users
-- WHERE is_guest = TRUE
-- GROUP BY DATE(guest_created_at)
-- ORDER BY date DESC;

-- Most viewed questions by guests
-- SELECT
--   metadata->>'company' as company,
--   metadata->>'difficulty' as difficulty,
--   COUNT(*) as views
-- FROM guest_activity
-- WHERE action = 'question_viewed'
-- GROUP BY metadata->>'company', metadata->>'difficulty'
-- ORDER BY views DESC;
