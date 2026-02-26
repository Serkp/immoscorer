-- ============================================================
-- ImmoScorer — Supabase Setup V2
-- Erweitert analyses-Tabelle um flache Spalten für Vergleich.
-- Dieses Script im Supabase SQL Editor ausführen.
-- Kann mehrfach ausgeführt werden (idempotent).
-- ============================================================

-- ── Analyses: flat columns for comparison ──
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS purchase_price numeric;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS monthly_rent numeric;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS area_sqm numeric;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS building_year integer;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS energy_class text;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS location_grade text;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS management_fee numeric;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS renovation_count integer DEFAULT 0;

-- Score columns
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS total_score integer;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS investment_score integer;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS rentability_score integer;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS risk_score integer;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS financing_score integer;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS projection_score integer;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS energy_score integer;

-- KPI columns
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS gross_yield numeric;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS net_yield numeric;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS price_factor numeric;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS sqm_price numeric;

-- ── Financing Leads (if not yet created) ──
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
ALTER TABLE financing_leads ADD COLUMN IF NOT EXISTS source text DEFAULT 'analysis';
ALTER TABLE financing_leads ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE financing_leads ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE financing_leads ADD COLUMN IF NOT EXISTS monthly_rent numeric;

ALTER TABLE financing_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users insert own financing leads" ON financing_leads;
DROP POLICY IF EXISTS "Users read own financing leads" ON financing_leads;
CREATE POLICY "Users insert own financing leads" ON financing_leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own financing leads" ON financing_leads FOR SELECT USING (auth.uid() = user_id);

-- ── Analyses RLS (safety re-apply) ──
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own analyses" ON analyses;
CREATE POLICY "Users manage own analyses" ON analyses FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Setup V2 abgeschlossen.
-- Dieses Script kann jederzeit erneut ausgeführt werden.
-- ============================================================
DO $$ BEGIN RAISE NOTICE 'ImmoScorer Setup V2 abgeschlossen — flache Spalten und Policies sind aktuell.'; END $$;
