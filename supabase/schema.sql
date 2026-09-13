-- ==============================================================================
-- SUBSONIC SOCIETY - SUPABASE POSTGRESQL SCHEMA
-- Precision Rimfire Media, Bristol TN Championships, Telemetry & AI Moderation
-- ==============================================================================

-- 1. TELEMETRY & CLICKSTREAM EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'click', 'pageview', 'dwell', 'scroll', 'action'
    target_element TEXT NOT NULL,
    target_text TEXT,
    target_category TEXT,
    page_route TEXT NOT NULL,
    dwell_seconds INTEGER,
    scroll_depth INTEGER,
    session_id TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    device_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for fast analytics aggregations
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON public.telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_page_route ON public.telemetry_events(page_route);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON public.telemetry_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_session ON public.telemetry_events(session_id);

-- 2. CHAT TRANSMISSIONS & AI MODERATION TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_callsign TEXT,
    author_role TEXT NOT NULL DEFAULT 'MEMBER',
    author_badge TEXT,
    content TEXT NOT NULL,
    moderation_status TEXT NOT NULL DEFAULT 'APPROVED', -- 'APPROVED', 'FLAGGED', 'REJECTED'
    ai_toxicity_score INTEGER DEFAULT 0,
    ai_threat_score INTEGER DEFAULT 0,
    ai_policy_score INTEGER DEFAULT 0,
    ai_flag_reason TEXT,
    ai_sentiment TEXT DEFAULT 'NEUTRAL',
    reactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_channel ON public.chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_moderation_status ON public.chat_messages(moderation_status);

-- 3. COMPETITION MATCHES & EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    match_date TEXT NOT NULL,
    location TEXT NOT NULL,
    tier TEXT NOT NULL, -- 'PRO_SERIES', 'REGIONAL_QUALIFIER', 'CLINIC'
    stages INTEGER NOT NULL DEFAULT 10,
    round_count INTEGER NOT NULL DEFAULT 100,
    distance_range TEXT,
    max_competitors INTEGER NOT NULL DEFAULT 100,
    registered_count INTEGER NOT NULL DEFAULT 0,
    entry_fee NUMERIC NOT NULL DEFAULT 0,
    prize_pool TEXT,
    status TEXT NOT NULL DEFAULT 'REGISTRATION_OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COMPETITOR SQUAD REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id TEXT REFERENCES public.matches(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    competitor_email TEXT NOT NULL,
    rifle_division TEXT NOT NULL, -- 'OPEN', 'PRODUCTION', 'SENIOR', 'LADIES', 'YOUTH'
    squad_flight TEXT NOT NULL,
    rifle_model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. LIVE SOCIAL MEDIA POSTS TABLE (Facebook / Meta / Make.com sync)
CREATE TABLE IF NOT EXISTS public.social_posts (
    id TEXT PRIMARY KEY,
    post_id TEXT UNIQUE,
    platform TEXT NOT NULL DEFAULT 'FACEBOOK',
    content TEXT NOT NULL,
    published_at TEXT NOT NULL,
    image_url TEXT,
    external_url TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    category TEXT DEFAULT 'ALL',
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_category ON public.social_posts(category);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Allow public telemetry insertion
CREATE POLICY "Allow public telemetry ingest" ON public.telemetry_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public telemetry read for admin" ON public.telemetry_events
    FOR SELECT USING (true);

-- Allow public to read approved chat messages
CREATE POLICY "Allow reading approved chat" ON public.chat_messages
    FOR SELECT USING (true);

-- Allow inserting chat
CREATE POLICY "Allow posting chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (true);

-- Allow reading matches
CREATE POLICY "Allow public read matches" ON public.matches
    FOR SELECT USING (true);

-- Allow registering for matches
CREATE POLICY "Allow competitor registrations" ON public.registrations
    FOR INSERT WITH CHECK (true);

-- Allow public reading of live social posts
CREATE POLICY "Allow reading social posts" ON public.social_posts
    FOR SELECT USING (true);

-- Allow inserting/updating social posts via webhook
CREATE POLICY "Allow webhook upsert social posts" ON public.social_posts
    FOR ALL USING (true);

