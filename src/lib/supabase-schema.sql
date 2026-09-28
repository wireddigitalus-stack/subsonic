-- Supabase Schema definition for Subsonic Society

-- Society Members Table
CREATE TABLE IF NOT EXISTS society_members (
    member_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    callsign TEXT,
    email TEXT,
    state TEXT,
    experience_level TEXT,
    rifle_setup TEXT,
    interests JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT,
    role TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_society_members_callsign ON society_members(callsign);
CREATE INDEX IF NOT EXISTS idx_society_members_email ON society_members(email);

-- Shooters Table
CREATE TABLE IF NOT EXISTS shooters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    callsign TEXT,
    division TEXT,
    ranking TEXT,
    home_range TEXT,
    podiums INTEGER,
    featured_match TEXT,
    image TEXT,
    action_photo TEXT,
    quote TEXT,
    accolades JSONB,
    sponsors JSONB,
    rifle_setup JSONB,
    pin TEXT,
    interview JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT
);

CREATE INDEX IF NOT EXISTS idx_shooters_callsign ON shooters(callsign);

-- Invites Table
CREATE TABLE IF NOT EXISTS invites (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL,
    recipient_name TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    note TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    claimed_by JSONB,
    status TEXT DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
