CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
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
  brief_date       DATE NOT NULL,
  recipient_email  TEXT NOT NULL,
  content          TEXT NOT NULL,
  sent_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_lead ON pipeline_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_briefs_date ON briefs(brief_date);

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
