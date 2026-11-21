-- SatyaSell T4: business configuration tables. ADDITIVE ONLY (new tables, nothing existing is changed).
-- Run once in the Supabase SQL editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS config_draft (
  id          TEXT PRIMARY KEY DEFAULT 'main',
  revision    INTEGER NOT NULL DEFAULT 1,
  snapshot    JSONB NOT NULL,
  updated_by  TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_releases (
  version       INTEGER PRIMARY KEY,
  label         TEXT NOT NULL,
  snapshot      JSONB NOT NULL,
  published_by  TEXT,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_audit (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action      TEXT NOT NULL,
  version     INTEGER,
  actor       TEXT,
  detail      JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_config_audit_created ON config_audit (created_at);

CREATE TABLE IF NOT EXISTS tenant_business_configs (
  tenant_id          TEXT PRIMARY KEY REFERENCES tenants (id) ON DELETE CASCADE,
  business_types     JSONB NOT NULL DEFAULT '[]'::jsonb,
  onboarding_source  TEXT,
  config_version     INTEGER,
  self_serve         BOOLEAN NOT NULL DEFAULT false,
  confirmed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Defence in depth: the app reaches these tables only through the server (Prisma).
-- RLS with no policies blocks direct access from the public Supabase API keys.
ALTER TABLE config_draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_business_configs ENABLE ROW LEVEL SECURITY;
