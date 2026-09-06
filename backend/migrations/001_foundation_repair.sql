-- Apply once to databases created with the original ADRConnect schema.
-- This migration is additive and does not remove existing data.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE high_alerts
    ADD COLUMN IF NOT EXISTS severity_level TEXT NOT NULL DEFAULT 'HIGH';
