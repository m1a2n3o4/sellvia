-- SatyaSell T5: configurable product fields. ADDITIVE ONLY (one new table; products and product_variants are not changed).
-- Run once in the Supabase SQL editor. Safe to re-run.
CREATE TABLE IF NOT EXISTS product_extras (
  product_id        TEXT PRIMARY KEY REFERENCES products (id) ON DELETE CASCADE,
  tenant_id         TEXT NOT NULL,
  business_type_id  TEXT NOT NULL,
  config_version    INTEGER NOT NULL,
  attributes        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_extras_tenant ON product_extras (tenant_id);
ALTER TABLE product_extras ENABLE ROW LEVEL SECURITY;
