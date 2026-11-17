-- UrbanPro Portal / Neon PostgreSQL Comprehensive Schema
--
-- Tables for all portal modules:
-- 1. enquiries (Website quote requests & leads)
-- 2. surveys (Add survey & all surveys)
-- 3. quotations (Add quotation & all quotations)
-- 4. packing_lists (Add packing list & all packing lists)
-- 5. bilties (Add bilty / LR & all bilties)
-- 6. bills (GST Tax Invoices & all bills)
-- 7. money_receipts (Add money receipt & all money receipts)
-- 8. payment_vouchers (Add payment voucher & all payment vouchers)
-- 9. car_conditions (Add car condition & all car condition reports)
-- 10. bike_conditions (Add bike condition & all bike condition reports)
-- 11. company_profile (Company branding, bank details, GSTIN, addresses)
-- 12. app_settings (Digital signatures & portal configuration)
-- 13. portal_collections (Fast reactive document synchronization for UI & SSE)

CREATE TABLE IF NOT EXISTS portal_collections (
  collection_key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portal_collections_updated_at_idx
  ON portal_collections (updated_at DESC);

-- 1. Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  moving_from TEXT,
  moving_to TEXT,
  moving_date TEXT,
  service_type TEXT,
  items TEXT,
  item_rows JSONB,
  message TEXT,
  whatsapp_url TEXT,
  status TEXT DEFAULT 'New',
  admin_notes TEXT DEFAULT '',
  email_delivered BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS enquiries_submitted_at_idx ON enquiries (submitted_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries (status);
CREATE INDEX IF NOT EXISTS enquiries_phone_idx ON enquiries (phone);

-- 2. Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,
  survey_no TEXT,
  survey_date TEXT,
  party_name TEXT NOT NULL,
  mobile_no TEXT,
  email TEXT,
  packing_date TEXT,
  delivery_date TEXT,
  from_city TEXT,
  to_city TEXT,
  items JSONB,
  advance_pay TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS surveys_survey_no_idx ON surveys (survey_no);
CREATE INDEX IF NOT EXISTS surveys_party_name_idx ON surveys (party_name);

-- 3. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quotation_no TEXT,
  quotation_date TEXT,
  party_name TEXT NOT NULL,
  mobile_no TEXT,
  email TEXT,
  net_amount TEXT,
  total_amount TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotations_quotation_no_idx ON quotations (quotation_no);
CREATE INDEX IF NOT EXISTS quotations_party_name_idx ON quotations (party_name);

-- 4. Packing Lists Table
CREATE TABLE IF NOT EXISTS packing_lists (
  id TEXT PRIMARY KEY,
  packing_list_no TEXT,
  packing_date TEXT,
  party_name TEXT NOT NULL,
  mobile_no TEXT,
  total_items INTEGER,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS packing_lists_no_idx ON packing_lists (packing_list_no);
CREATE INDEX IF NOT EXISTS packing_lists_party_name_idx ON packing_lists (party_name);

-- 5. Bilties (LR) Table
CREATE TABLE IF NOT EXISTS bilties (
  id TEXT PRIMARY KEY,
  bilty_no TEXT,
  bilty_date TEXT,
  consignor_name TEXT NOT NULL,
  consignor_mobile TEXT,
  consignee_name TEXT,
  consignee_mobile TEXT,
  from_city TEXT,
  to_city TEXT,
  truck_no TEXT,
  total_freight TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bilties_bilty_no_idx ON bilties (bilty_no);
CREATE INDEX IF NOT EXISTS bilties_consignor_idx ON bilties (consignor_name);

-- 6. Bills (GST Invoices) Table
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  bill_no TEXT,
  bill_date TEXT,
  party_name TEXT NOT NULL,
  mobile_no TEXT,
  total_amount TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bills_bill_no_idx ON bills (bill_no);
CREATE INDEX IF NOT EXISTS bills_party_name_idx ON bills (party_name);

-- 7. Money Receipts Table
CREATE TABLE IF NOT EXISTS money_receipts (
  id TEXT PRIMARY KEY,
  receipt_no TEXT,
  receipt_date TEXT,
  received_from TEXT NOT NULL,
  mobile_no TEXT,
  amount TEXT,
  payment_mode TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS money_receipts_no_idx ON money_receipts (receipt_no);
CREATE INDEX IF NOT EXISTS money_receipts_received_from_idx ON money_receipts (received_from);

-- 8. Payment Vouchers Table
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id TEXT PRIMARY KEY,
  voucher_no TEXT,
  voucher_date TEXT,
  paid_to TEXT NOT NULL,
  amount TEXT,
  debit_head TEXT,
  payment_mode TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vouchers_voucher_no_idx ON payment_vouchers (voucher_no);
CREATE INDEX IF NOT EXISTS vouchers_paid_to_idx ON payment_vouchers (paid_to);

-- 9. Car Condition Reports Table
CREATE TABLE IF NOT EXISTS car_conditions (
  id TEXT PRIMARY KEY,
  report_no TEXT,
  date TEXT,
  owner_name TEXT NOT NULL,
  mobile_no TEXT,
  car_make_model TEXT,
  reg_no TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS car_conditions_report_no_idx ON car_conditions (report_no);
CREATE INDEX IF NOT EXISTS car_conditions_owner_name_idx ON car_conditions (owner_name);

-- 10. Bike Condition Reports Table
CREATE TABLE IF NOT EXISTS bike_conditions (
  id TEXT PRIMARY KEY,
  report_no TEXT,
  date TEXT,
  owner_name TEXT NOT NULL,
  mobile_no TEXT,
  bike_make_model TEXT,
  reg_no TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bike_conditions_report_no_idx ON bike_conditions (report_no);
CREATE INDEX IF NOT EXISTS bike_conditions_owner_name_idx ON bike_conditions (owner_name);

-- 11. Company Profile Table
CREATE TABLE IF NOT EXISTS company_profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  profile_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  global_signature JSONB,
  company_signature TEXT,
  settings JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
