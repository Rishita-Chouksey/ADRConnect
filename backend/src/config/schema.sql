-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('nurse', 'adr_head', 'administrator');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE case_type_enum AS ENUM ('initial', 'follow_up');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE submission_state_enum AS ENUM ('draft', 'partial', 'complete');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sync_status_enum AS ENUM ('pending', 'synced', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    employee_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    ward TEXT,
    occupation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users(hospital_id);

-- 3. Global Drug Products
CREATE TABLE IF NOT EXISTS drug_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    generic_name TEXT,
    form TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_drug_products_name ON drug_products(name) WHERE is_active = TRUE;

-- 4. Global Manufacturers
CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    license_no TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name ON manufacturers(name) WHERE is_active = TRUE;

-- 5. Hospital-Scoped Batches
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_uuid UUID UNIQUE,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES drug_products(id) ON DELETE RESTRICT,
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE RESTRICT,
    batch_no TEXT NOT NULL,
    mfg_date DATE,
    exp_date DATE,
    barcode_data TEXT,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_batch_per_hospital UNIQUE(hospital_id, product_id, manufacturer_id, batch_no)
);
CREATE INDEX IF NOT EXISTS idx_batches_lookup ON batches(hospital_id, product_id, manufacturer_id, batch_no);
CREATE INDEX IF NOT EXISTS idx_batches_active ON batches(hospital_id, is_active) WHERE is_active = TRUE;

-- 6. Hospital-Scoped ADR Reports
CREATE TABLE IF NOT EXISTS adr_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_uuid UUID NOT NULL UNIQUE,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    case_type case_type_enum NOT NULL DEFAULT 'initial',
    submission_state submission_state_enum NOT NULL,
    pvpi_sent BOOLEAN NOT NULL DEFAULT FALSE,
    pvpi_sent_at TIMESTAMPTZ,
    patient_initials TEXT NOT NULL,
    patient_age TEXT NOT NULL,
    patient_sex TEXT NOT NULL,
    patient_weight_kg NUMERIC(5,2),
    reg_ipd_opd_no TEXT,
    amc_report_no TEXT,
    worldwide_unique_no TEXT,
    reaction_start_date DATE NOT NULL,
    reaction_stop_date DATE,
    onset_lag_time TEXT,
    reaction_description TEXT NOT NULL,
    lab_data_tests TEXT,
    other_history TEXT,
    seriousness_flags JSONB,
    outcome TEXT,
    concomitant_drugs JSONB,
    additional_info TEXT,
    sync_status sync_status_enum NOT NULL DEFAULT 'synced',
    ward TEXT NOT NULL,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_adr_reports_hospital_state ON adr_reports(hospital_id, submission_state);
CREATE INDEX IF NOT EXISTS idx_adr_reports_reaction_date ON adr_reports(hospital_id, reaction_start_date DESC);

-- 7. Suspected Medications
CREATE TABLE IF NOT EXISTS adr_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adr_report_id UUID NOT NULL REFERENCES adr_reports(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
    row_order INT NOT NULL,
    dose_used TEXT,
    route_used TEXT,
    frequency TEXT,
    therapy_start_date DATE,
    therapy_stop_date DATE,
    indication TEXT,
    action_taken TEXT,
    reintroduction_reaction TEXT,
    reintroduction_dose TEXT,
    causality_assessment TEXT
);
CREATE INDEX IF NOT EXISTS idx_adr_medications_batch ON adr_medications(batch_id);
CREATE INDEX IF NOT EXISTS idx_adr_medications_report ON adr_medications(adr_report_id);

-- 8. High Alert Flags
CREATE TABLE IF NOT EXISTS high_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    flagged_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    flagged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_target CHECK (batch_id IS NOT NULL OR manufacturer_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_high_alerts_batch ON high_alerts(hospital_id, batch_id) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_high_alerts_mfg ON high_alerts(hospital_id, manufacturer_id) WHERE active = TRUE;

-- 9. Caution Notifications
CREATE TABLE IF NOT EXISTS caution_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    CONSTRAINT check_caution_target CHECK (batch_id IS NOT NULL OR manufacturer_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_caution_unack ON caution_notifications(hospital_id, acknowledged, sent_at DESC) WHERE acknowledged = FALSE;

-- 10. Audit Amendments
CREATE TABLE IF NOT EXISTS adr_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adr_report_id UUID NOT NULL REFERENCES adr_reports(id) ON DELETE CASCADE,
    adr_medication_id UUID REFERENCES adr_medications(id) ON DELETE SET NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    edited_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    edited_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_adr_amendments_report ON adr_amendments(adr_report_id);