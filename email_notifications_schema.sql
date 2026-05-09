-- =============================================================
-- Email Notifications Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================

-- 1. Add email_notifications column to users table
-- Default TRUE so existing users receive emails until they unsubscribe
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;

-- =============================================================
-- Cron Job Setup (requires pg_cron and pg_net extensions)
-- This schedules the daily-reminder-cron Edge Function to run
-- every day at 6pm IST (12:30 UTC)
-- =============================================================

-- 2. Enable required extensions (if not already enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Schedule the daily reminder cron job
-- IMPORTANT: Replace YOUR_SERVICE_ROLE_KEY with your actual Supabase service role key
-- You can find it in: Supabase Dashboard → Settings → API → Service role key
--
-- SELECT cron.schedule(
--   'daily-reminder',
--   '30 12 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://zwovsxtmzrrhalrklxyv.supabase.co/functions/v1/daily-reminder-cron',
--     headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )
--   $$
-- );

-- =============================================================
-- Useful queries
-- =============================================================

-- Check who has email notifications enabled:
-- SELECT id, name, email, email_notifications FROM users WHERE email_notifications = TRUE;

-- Manually toggle notifications for a user:
-- UPDATE users SET email_notifications = FALSE WHERE id = 'USER_UUID_HERE';
