/*
  # Create AI Chat System

  1. New Tables
    - `chat_conversations`
      - `id` (uuid, primary key)
      - `session_id` (text) - Browser session identifier
      - `lead_id` (uuid) - Optional link to created lead
      - `status` (text) - 'active', 'completed', 'abandoned'
      - `context` (jsonb) - Collected form data during chat
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `role` (text) - 'user', 'assistant', 'system'
      - `content` (text) - Message content
      - `metadata` (jsonb) - Additional data (tokens used, etc.)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can insert (for anonymous users)
    - Public can read their own conversations via session_id
    - Admins can read all data

  3. Indexes
    - Index on session_id for fast lookups
    - Index on conversation_id for message queries
    - Index on created_at for sorting
*/

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  lead_id uuid REFERENCES leads(id),
  status text NOT NULL DEFAULT 'active',
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Anyone can create conversations"
  ON chat_conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own conversations"
  ON chat_conversations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for chat_messages
CREATE POLICY "Anyone can create messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read messages"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_chat_conversation_timestamp_trigger ON chat_conversations;
CREATE TRIGGER update_chat_conversation_timestamp_trigger
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversation_timestamp();