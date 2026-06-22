CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Accounts (tenants) ──────────────────────────────────────────────────────
-- Each DeckBrief customer is an account. admin_key gates their CRM/dashboard;
-- intake_key is the public token embedded in their lead-capture form.
CREATE TABLE IF NOT EXISTS accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  admin_key     TEXT NOT NULL UNIQUE,
  intake_key    TEXT NOT NULL UNIQUE,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default account = your own DeckBrief business. Fixed ID so backfill is stable.
-- Its intake_key is the public token the main deckbrief.html form uses.
INSERT INTO accounts (id, name, email, admin_key, intake_key)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'NerdCommand (DeckBrief)',
  'chapmancapital1@gmail.com',
  'default-admin-' || encode(gen_random_bytes(16), 'hex'),
  'deckbrief-default'
)
ON CONFLICT (id) DO NOTHING;

-- ── Leads ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID REFERENCES accounts(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  business_name TEXT,
  lead_volume   TEXT,
  source        TEXT DEFAULT 'deckbrief-page',
  status        TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','contacted','qualified','proposal','closed_won','closed_lost')),
  notes         TEXT,
  ai_draft      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate older single-tenant installs: add account_id if missing, backfill, scope uniqueness per account.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
UPDATE leads SET account_id = '00000000-0000-0000-0000-000000000001' WHERE account_id IS NULL;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_email_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_account_email_uniq'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_account_email_uniq UNIQUE (account_id, email);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pipeline_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL
                CHECK (event_type IN ('status_change','email_sent','note_added','brief_included','draft_generated')),
  old_value   TEXT,
  new_value   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS briefs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       UUID REFERENCES accounts(id) ON DELETE CASCADE,
  brief_date       DATE NOT NULL,
  recipient_email  TEXT NOT NULL,
  content          TEXT NOT NULL,
  sent_at          TIMESTAMPTZ
);
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
UPDATE briefs SET account_id = '00000000-0000-0000-0000-000000000001' WHERE account_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_account ON leads(account_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_lead ON pipeline_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_briefs_date ON briefs(brief_date);
CREATE INDEX IF NOT EXISTS idx_briefs_account ON briefs(account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_admin_key ON accounts(admin_key);
CREATE INDEX IF NOT EXISTS idx_accounts_intake_key ON accounts(intake_key);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
