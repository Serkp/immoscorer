-- ══════════════════════════════════════════════════════════════
-- ImmoScorer: Database Schema
-- Run this in your Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ── analyses (comparison saves + analysis results) ──
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  -- Property inputs
  address TEXT,
  city TEXT,
  purchase_price NUMERIC,
  monthly_rent NUMERIC,
  area_sqm NUMERIC,
  building_year INTEGER,
  energy_class TEXT,
  location_grade TEXT,
  management_fee NUMERIC,
  renovation_count INTEGER,
  -- Scores
  total_score INTEGER,
  investment_score INTEGER,
  rentability_score INTEGER,
  risk_score INTEGER,
  financing_score INTEGER,
  projection_score INTEGER,
  energy_score INTEGER,
  -- KPIs
  gross_yield NUMERIC,
  net_yield NUMERIC,
  price_factor NUMERIC,
  sqm_price NUMERIC,
  -- Legacy JSON fields
  property_id UUID,
  inputs JSONB,
  result JSONB,
  -- Meta
  status TEXT DEFAULT 'saved',
  save_type TEXT DEFAULT 'comparison',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── portfolio_properties ──
CREATE TABLE IF NOT EXISTS portfolio_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT,
  city TEXT,
  purchase_price NUMERIC,
  current_rent NUMERIC,
  area NUMERIC,
  build_year INTEGER,
  energy_class TEXT,
  house_money NUMERIC,
  location_grade TEXT,
  renovations JSONB DEFAULT '[]',
  score INTEGER,
  score_data JSONB,
  location_data JSONB,
  lat NUMERIC,
  lng NUMERIC,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── properties (legacy) ──
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  street TEXT,
  city TEXT,
  price NUMERIC,
  rent NUMERIC,
  hausgeld NUMERIC,
  area NUMERIC,
  year INTEGER,
  energy_class TEXT,
  location_grade TEXT,
  renovations JSONB DEFAULT '[]',
  total_score INTEGER,
  result JSONB,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── subscriptions ──
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'inactive',
  plan TEXT DEFAULT 'free',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
-- Enable Row Level Security
-- ══════════════════════════════════════
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════
-- RLS Policies: users can only access their own rows
-- ══════════════════════════════════════

-- analyses
CREATE POLICY analyses_select_own ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY analyses_insert_own ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY analyses_update_own ON analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY analyses_delete_own ON analyses FOR DELETE USING (auth.uid() = user_id);

-- portfolio_properties
CREATE POLICY portfolio_select_own ON portfolio_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY portfolio_insert_own ON portfolio_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY portfolio_update_own ON portfolio_properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY portfolio_delete_own ON portfolio_properties FOR DELETE USING (auth.uid() = user_id);

-- properties
CREATE POLICY properties_select_own ON properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY properties_insert_own ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY properties_update_own ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY properties_delete_own ON properties FOR DELETE USING (auth.uid() = user_id);

-- subscriptions
CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY subscriptions_insert_own ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY subscriptions_update_own ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
