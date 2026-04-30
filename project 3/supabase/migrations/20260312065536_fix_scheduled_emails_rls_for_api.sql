/*
  # Fix RLS Policies for Scheduled Emails Table
  
  1. Changes
    - Add INSERT policy for anon role to allow API to create scheduled emails
    - Add UPDATE policy for anon role to allow status updates
  
  2. Security
    - Policies restricted to specific operations needed by API
*/

CREATE POLICY "Anon can insert scheduled emails"
  ON scheduled_emails
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update scheduled emails"
  ON scheduled_emails
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);