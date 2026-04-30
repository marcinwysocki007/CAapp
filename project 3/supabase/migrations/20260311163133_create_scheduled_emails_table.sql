/*
  # Scheduled Emails System
  
  1. New Tables
    - `scheduled_emails`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `email_type` (text) - Type of email to send (e.g., 'angebot')
      - `recipient_email` (text) - Email address to send to
      - `scheduled_for` (timestamptz) - When to send the email
      - `sent_at` (timestamptz, nullable) - When the email was actually sent
      - `status` (text) - pending, sent, failed, cancelled
      - `error_message` (text, nullable) - Error message if failed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Allow service role full access for API operations
*/

CREATE TABLE IF NOT EXISTS scheduled_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status_scheduled 
  ON scheduled_emails(status, scheduled_for) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_lead_id 
  ON scheduled_emails(lead_id);

ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage scheduled emails"
  ON scheduled_emails
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view scheduled emails"
  ON scheduled_emails
  FOR SELECT
  TO authenticated
  USING (true);
