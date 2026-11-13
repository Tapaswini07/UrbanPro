-- UrbanPro Portal / Neon PostgreSQL schema
--
-- Each collection is a JSONB document so existing portal records retain all
-- their fields (including variable item lists and uploaded base64 images)
-- during the localStorage-to-PostgreSQL migration.  collection_key scopes
-- each document type, and updated_at supports audit and future live-sync.

CREATE TABLE IF NOT EXISTS portal_collections (
  collection_key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portal_collections_updated_at_idx
  ON portal_collections (updated_at DESC);

-- Valid collection keys:
-- upl_quote_requests, upl_surveys, upl_quotations, upl_packing_lists,
-- upl_bilties, upl_bills, upl_money_receipts, upl_vouchers,
-- upl_car_conditions, upl_bike_conditions, upl_company_profile,
-- upl_global_signature, upl_company_signature.
