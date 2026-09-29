-- ============================================================================
-- SUBSONIC SOCIETY — Supabase Database Migration
-- Run this in your Supabase SQL Editor to create all required tables
-- ============================================================================

-- 1. SOCIETY MEMBERS
CREATE TABLE IF NOT EXISTS society_members (
  member_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  callsign TEXT UNIQUE,
  email TEXT,
  state TEXT DEFAULT 'TN',
  experience_level TEXT DEFAULT 'Club Match Competitor',
  rifle_setup TEXT DEFAULT 'Precision Rimfire',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PROVISIONAL', 'HONORARY', 'PAUSED', 'BANNED')),
  role TEXT DEFAULT 'MEMBER' CHECK (role IN ('MASTER_OWNER', 'DEV_ADMIN', 'OWNER_ADMIN', 'ADMIN', 'MODERATOR', 'MATCH_DIRECTOR', 'OFFICIAL', 'PRO_COMPETITOR', 'MEMBER')),
  notes TEXT,
  pin_hash TEXT
);

-- 2. INVITES
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('PRO', 'MEMBER')),
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  note TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  max_uses INT DEFAULT 1,
  used_count INT DEFAULT 0,
  claimed_by TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXHAUSTED', 'REVOKED'))
);

-- 3. SHOOTERS (Pro Competitor Profiles)
CREATE TABLE IF NOT EXISTS shooters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  callsign TEXT UNIQUE,
  division TEXT,
  ranking TEXT,
  home_range TEXT,
  podiums INT DEFAULT 0,
  featured_match TEXT,
  image TEXT,
  action_photo TEXT,
  quote TEXT,
  accolades TEXT[] DEFAULT '{}',
  sponsors TEXT[] DEFAULT '{}',
  rifle_setup JSONB DEFAULT '{}',
  pin TEXT,
  interview JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'PENDING_REVIEW', 'ARCHIVED'))
);

-- 4. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL DEFAULT 'invitational',
  type TEXT DEFAULT 'STANDARD' CHECK (type IN ('STANDARD', 'DOPE_DROP', 'MATCH_ALERT', 'RADIO_CHECK')),
  dope_card JSONB,
  author JSONB NOT NULL,
  content TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  reactions JSONB DEFAULT '[]',
  moderation_status TEXT DEFAULT 'APPROVED' CHECK (moderation_status IN ('APPROVED', 'FLAGGED', 'PENDING_REVIEW', 'REJECTED')),
  ai_moderation_report JSONB
);

-- Index for fast channel queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages("timestamp" DESC);

-- 5. REGISTRATIONS
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY DEFAULT ('reg-' || extract(epoch from now())::text),
  ticket_number TEXT,
  match_id TEXT,
  match_title TEXT,
  competitor_name TEXT NOT NULL,
  competitor_callsign TEXT,
  competitor_email TEXT NOT NULL,
  competitor_phone TEXT,
  rifle_division TEXT DEFAULT 'OPEN',
  squad_name TEXT,
  squad_flight TEXT,
  rifle_model TEXT,
  optic TEXT,
  ammo_lot TEXT,
  addons TEXT[] DEFAULT '{}',
  total_price NUMERIC DEFAULT 275,
  payment_status TEXT DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING', 'WAIVED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTACT LEADS
CREATE TABLE IF NOT EXISTS contact_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT DEFAULT 'GENERAL' CHECK (category IN ('GENERAL', 'SPONSORSHIP', 'MATCH_HOST', 'SUBSONIC_DNA', 'MEDIA')),
  subject TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_REVIEW', 'CONTACTED', 'ARCHIVED'))
);

-- 7. SOCIAL POSTS (Facebook Webhook)
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  post_id TEXT UNIQUE,
  content TEXT,
  published_at TIMESTAMPTZ,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  image_url TEXT,
  video_url TEXT,
  external_url TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'ALL' CHECK (category IN ('ALL', 'MATCHES', 'BALLISTICS', 'MEDIA')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TELEMETRY EVENTS
CREATE TABLE IF NOT EXISTS telemetry_events (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  event_type TEXT NOT NULL,
  target_element TEXT,
  target_text TEXT,
  target_category TEXT,
  page_route TEXT,
  is_member BOOLEAN DEFAULT false,
  member_type TEXT,
  member_id TEXT,
  member_callsign TEXT,
  member_name TEXT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  device JSONB,
  session_id TEXT,
  visitor_id TEXT,
  dwell_seconds NUMERIC,
  scroll_depth NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_events("timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON telemetry_events(event_type);

-- 9. MATCHES (for registration count tracking)
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  title TEXT,
  registered_count INT DEFAULT 0,
  max_competitors INT DEFAULT 80,
  status TEXT DEFAULT 'REGISTRATION_OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE REALTIME on chat_messages for live WebSocket updates
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================================================
-- SEED EXECUTIVE ACCOUNTS (Rob & Allen)
-- ============================================================================
INSERT INTO society_members (member_id, full_name, callsign, email, state, experience_level, rifle_setup, interests, status, role, notes)
VALUES
  ('SS-2026-0001', 'Rob Neilson', 'RADAR', 'rob@subsonicsociety.com', 'TN', 'Lead Developer & Tech Advisor', 'Smart Systems Integrations', ARRAY['Smart Systems Integrations', 'Dev Operations', 'AI & Telemetry', 'Private Comms', 'Tech Advisory'], 'ACTIVE', 'MASTER_OWNER', 'Master Owner, Lead Developer & Tech Advisor'),
  ('SS-2026-0002', 'Allen Hurley', 'ALLEN', 'allen@subsonicsociety.com', 'TN', 'Owner Admin / Executive', 'Modacam Custom Precision V-22 / ZCO 527', ARRAY['Society Leadership', 'Executive Comms', 'Match Operations', 'The Hideout Bristol'], 'ACTIVE', 'OWNER_ADMIN', 'Owner Admin & Executive')
ON CONFLICT (member_id) DO NOTHING;

-- ============================================================================
-- SEED DEFAULT INVITES
-- ============================================================================
INSERT INTO invites (id, code, tier, recipient_name, note, created_by, max_uses, used_count, claimed_by, status)
VALUES
  ('seed-pro-v793', 'SS-PRO-V793', 'PRO', 'VIP Pro Competitor', 'VIP Pro Competitor Match Invite', 'ALLEN', 10, 0, '{}', 'ACTIVE'),
  ('seed-pro-vip', 'SS-PRO-VIP2026', 'PRO', 'Invitational Competitor VIP', 'Official VIP Pro Competitor match invite code', 'ALLEN', 150, 3, ARRAY['GHOST', 'COLDBORE', 'DIALED'], 'ACTIVE'),
  ('seed-mbr-open', 'SS-MBR-HIDE2026', 'MEMBER', 'Society Member Invite', 'General access code for private squad comms & member card', 'ALLEN', 250, 14, '{}', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
