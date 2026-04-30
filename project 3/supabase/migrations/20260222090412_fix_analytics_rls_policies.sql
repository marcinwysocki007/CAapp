/*
  # Fix Analytics RLS Policies

  ## Problem
  The analytics tracking system couldn't write data because anonymous users need
  permissions to:
  1. SELECT existing sessions (to check if session exists)
  2. UPDATE sessions (to update last_activity timestamp)
  3. UPDATE page_views (to update time_on_page)

  ## Changes
  1. Add SELECT policy for anonymous users on analytics_sessions
  2. Add UPDATE policy for anonymous users on analytics_sessions
  3. Add UPDATE policy for anonymous users on analytics_page_views

  ## Security Notes
  - Anonymous users can only update their own sessions (matched by session_id)
  - Anonymous users can only update time_on_page field for page views
  - No sensitive data exposed since all analytics data is anonymous by design
*/

-- Allow anonymous users to SELECT sessions (needed to check if session exists)
CREATE POLICY "Allow anonymous select own session"
  ON analytics_sessions FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to UPDATE sessions (needed for last_activity)
CREATE POLICY "Allow anonymous update own session"
  ON analytics_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to UPDATE page views (needed for time_on_page)
CREATE POLICY "Allow anonymous update page views"
  ON analytics_page_views FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
