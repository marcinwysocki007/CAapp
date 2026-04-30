/*
  # Fix scheduled_emails RLS - allow anon to read

  The admin frontend uses the anon key (cookie-based auth, not Supabase auth).
  The existing SELECT policy only allows 'authenticated' Supabase users,
  which means the admin CRM timeline cannot see scheduled emails.

  Changes:
  - Drop the existing SELECT policy that restricts to authenticated only
  - Add new SELECT policy that allows both anon and authenticated users to read
*/

DROP POLICY IF EXISTS "Authenticated users can view scheduled emails" ON scheduled_emails;

CREATE POLICY "Anon and authenticated users can view scheduled emails"
  ON scheduled_emails
  FOR SELECT
  TO anon, authenticated
  USING (true);
