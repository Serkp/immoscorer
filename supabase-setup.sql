-- ============================================================
-- ImmoScorer — Supabase Setup Script
-- Dieses Script im Supabase SQL Editor ausführen.
-- Kann mehrfach ausgeführt werden (idempotent).
-- ============================================================

-- ── Properties table: add missing columns ──
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- ── Analyses table: add missing columns ──
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS status text DEFAULT 'temporary';
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS save_type text DEFAULT NULL;

-- ── Profiles: newsletter opt-in ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS newsletter_opt_in boolean DEFAULT true;

-- ── Profiles RLS ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- ── Properties RLS ──
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own properties" ON properties;
CREATE POLICY "Users manage own properties" ON properties FOR ALL USING (auth.uid() = user_id);

-- ── Analyses RLS ──
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own analyses" ON analyses;
CREATE POLICY "Users manage own analyses" ON analyses FOR ALL USING (auth.uid() = user_id);

-- ── Portfolio Properties ──
CREATE TABLE IF NOT EXISTS portfolio_properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address text NOT NULL,
  city text,
  lat double precision,
  lng double precision,
  purchase_price numeric NOT NULL,
  current_rent numeric NOT NULL,
  purchase_date date,
  purchase_costs numeric,
  area numeric,
  build_year integer,
  energy_class text,
  house_money numeric,
  rooms integer,
  floor integer,
  work_done text,
  work_needed text,
  renovation_cost numeric,
  score integer,
  score_data jsonb,
  location_data jsonb,
  location_grade text,
  renovations text[] DEFAULT '{}',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE portfolio_properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own portfolio" ON portfolio_properties;
CREATE POLICY "Users manage own portfolio" ON portfolio_properties FOR ALL USING (auth.uid() = user_id);

-- ── Financing Leads ──
CREATE TABLE IF NOT EXISTS financing_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name text,
  last_name text,
  contact_email text,
  contact_phone text,
  message text,
  property_address text,
  property_price numeric,
  monthly_rent numeric,
  score integer,
  source text DEFAULT 'analysis',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);
-- Add new columns if table already exists (idempotent)
ALTER TABLE financing_leads ADD COLUMN IF NOT EXISTS source text DEFAULT 'analysis';
ALTER TABLE financing_leads ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE financing_leads ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE financing_leads ADD COLUMN IF NOT EXISTS monthly_rent numeric;

ALTER TABLE financing_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own financing leads" ON financing_leads;
DROP POLICY IF EXISTS "Users insert own financing leads" ON financing_leads;
DROP POLICY IF EXISTS "Users read own financing leads" ON financing_leads;
CREATE POLICY "Users insert own financing leads" ON financing_leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own financing leads" ON financing_leads FOR SELECT USING (auth.uid() = user_id);

-- ── Strategies ──
CREATE TABLE IF NOT EXISTS strategies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers jsonb,
  result_data jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own strategies" ON strategies;
CREATE POLICY "Users manage own strategies" ON strategies FOR ALL USING (auth.uid() = user_id);

-- ── Subscriptions RLS (safety) ──
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own subscription" ON subscriptions;
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Setup abgeschlossen.
-- Dieses Script kann jederzeit erneut ausgeführt werden.
-- ============================================================
DO $$ BEGIN RAISE NOTICE 'ImmoScorer Setup abgeschlossen — alle Tabellen und Policies sind aktuell.'; END $$;
