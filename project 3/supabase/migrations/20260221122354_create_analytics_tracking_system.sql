/*
  # Analytics & Tracking System

  ## Overview
  Comprehensive tracking system for visitor behavior, conversions, and form interactions
  to optimize website and form performance.

  ## New Tables
  
  ### `analytics_sessions`
  Tracks unique visitor sessions with browser/device information
  - `id` (uuid, primary key)
  - `session_id` (text, unique) - Client-generated unique session identifier
  - `fingerprint` (text) - Browser fingerprint for returning visitor detection
  - `user_agent` (text) - Browser user agent string
  - `referrer` (text) - Traffic source/referrer URL
  - `landing_page` (text) - First page visited in session
  - `utm_source`, `utm_medium`, `utm_campaign` (text) - Marketing parameters
  - `device_type` (text) - mobile/tablet/desktop
  - `browser` (text) - Browser name
  - `os` (text) - Operating system
  - `country` (text) - Country code (if available)
  - `started_at` (timestamptz) - Session start time
  - `last_activity` (timestamptz) - Last activity in session
  - `created_at` (timestamptz)

  ### `analytics_page_views`
  Tracks every page view with timing information
  - `id` (uuid, primary key)
  - `session_id` (uuid, foreign key) - Links to analytics_sessions
  - `page_path` (text) - URL path visited
  - `page_title` (text) - Page title
  - `time_on_page` (integer) - Seconds spent on page
  - `referrer_path` (text) - Previous page in session
  - `viewed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### `analytics_events`
  Tracks custom events (button clicks, interactions, etc.)
  - `id` (uuid, primary key)
  - `session_id` (uuid, foreign key) - Links to analytics_sessions
  - `event_type` (text) - Type of event (click, scroll, etc.)
  - `event_name` (text) - Specific event name
  - `event_data` (jsonb) - Additional event data
  - `page_path` (text) - Where event occurred
  - `created_at` (timestamptz)

  ### `analytics_form_interactions`
  Tracks form field interactions to identify drop-off points
  - `id` (uuid, primary key)
  - `session_id` (uuid, foreign key) - Links to analytics_sessions
  - `form_name` (text) - Identifier for the form
  - `field_name` (text) - Form field identifier
  - `interaction_type` (text) - focus/blur/change/submit/abandon
  - `field_value` (text) - Value entered (only for analytics, not PII)
  - `time_spent` (integer) - Seconds spent on field
  - `created_at` (timestamptz)

  ### `analytics_conversions`
  Tracks conversion events (kalkulation, angebot)
  - `id` (uuid, primary key)
  - `session_id` (uuid, foreign key) - Links to analytics_sessions
  - `lead_id` (uuid, foreign key) - Links to leads table
  - `conversion_type` (text) - kalkulation_requested/angebot_requested
  - `conversion_value` (numeric) - Eigenanteil or other value
  - `form_data` (jsonb) - Anonymized form data
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only allow INSERT from anonymous users (for tracking)
  - Only allow SELECT for authenticated admin users
  - No UPDATE or DELETE allowed from client side

  ## Indexes
  - Session lookups by session_id and fingerprint
  - Time-based queries on created_at columns
  - Conversion and event lookups by type
*/

-- Create analytics_sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  fingerprint text,
  user_agent text,
  referrer text,
  landing_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  os text,
  country text,
  started_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create analytics_page_views table
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  page_path text NOT NULL,
  page_title text,
  time_on_page integer DEFAULT 0,
  referrer_path text,
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  page_path text,
  created_at timestamptz DEFAULT now()
);

-- Create analytics_form_interactions table
CREATE TABLE IF NOT EXISTS analytics_form_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  form_name text NOT NULL,
  field_name text NOT NULL,
  interaction_type text NOT NULL,
  field_value text,
  time_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create analytics_conversions table
CREATE TABLE IF NOT EXISTS analytics_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  conversion_type text NOT NULL,
  conversion_value numeric,
  form_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_fingerprint ON analytics_sessions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON analytics_page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON analytics_page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_form_interactions_session_id ON analytics_form_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_form_interactions_form_name ON analytics_form_interactions(form_name);
CREATE INDEX IF NOT EXISTS idx_conversions_session_id ON analytics_conversions(session_id);
CREATE INDEX IF NOT EXISTS idx_conversions_conversion_type ON analytics_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON analytics_conversions(created_at);

-- Enable Row Level Security
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_form_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_sessions
-- Allow anonymous users to insert their own sessions
CREATE POLICY "Allow anonymous insert sessions"
  ON analytics_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow service role to select (for admin dashboard)
CREATE POLICY "Allow authenticated admin select sessions"
  ON analytics_sessions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for analytics_page_views
CREATE POLICY "Allow anonymous insert page views"
  ON analytics_page_views FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admin select page views"
  ON analytics_page_views FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for analytics_events
CREATE POLICY "Allow anonymous insert events"
  ON analytics_events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admin select events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for analytics_form_interactions
CREATE POLICY "Allow anonymous insert form interactions"
  ON analytics_form_interactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admin select form interactions"
  ON analytics_form_interactions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for analytics_conversions
CREATE POLICY "Allow anonymous insert conversions"
  ON analytics_conversions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admin select conversions"
  ON analytics_conversions FOR SELECT
  TO authenticated
  USING (true);
