-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('nurse', 'adr_head', 'admin');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('initial', 'follow_up');

-- CreateEnum
CREATE TYPE "PatientSex" AS ENUM ('M', 'F', 'Other');

-- CreateEnum
CREATE TYPE "ReportOutcome" AS ENUM ('fatal', 'continuing', 'recovering', 'recovered', 'unknown');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('draft', 'submitted');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('pending', 'synced', 'failed');

-- CreateEnum
CREATE TYPE "ActionTaken" AS ENUM ('withdrawn', 'dose_increased', 'dose_reduced', 'not_changed', 'not_applicable', 'unknown');

-- CreateEnum
CREATE TYPE "ReintroductionReaction" AS ENUM ('yes', 'no', 'unknown', 'na');

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" "UserRole" NOT NULL,
    "employee_id" TEXT NOT NULL,
    "password_hash" TEXT,
    "ward" TEXT,
    "occupation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "form" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "license_no" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "manufacturer_id" TEXT NOT NULL,
    "batch_no" TEXT NOT NULL,
    "mfg_date" DATE,
    "exp_date" DATE,
    "barcode_data" TEXT,
    "added_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adr_reports" (
    "id" TEXT NOT NULL,
    "local_uuid" TEXT,
    "hospital_id" TEXT NOT NULL,
    "reporter_user_id" TEXT NOT NULL,
    "case_type" "CaseType" NOT NULL DEFAULT 'initial',
    "patient_initials" TEXT NOT NULL,
    "patient_age" TEXT NOT NULL,
    "patient_sex" "PatientSex" NOT NULL,
    "patient_weight_kg" DECIMAL(65,30),
    "reaction_start_date" DATE NOT NULL,
    "reaction_recovery_date" DATE,
    "reaction_description" TEXT NOT NULL,
    "other_history" TEXT,
    "seriousness_flags" JSONB,
    "outcome" "ReportOutcome",
    "status" "ReportStatus" NOT NULL DEFAULT 'draft',
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'pending',
    "ward" TEXT NOT NULL,
    "report_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adr_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adr_medications" (
    "id" TEXT NOT NULL,
    "adr_report_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "row_order" INTEGER NOT NULL DEFAULT 0,
    "dose_used" TEXT,
    "route_used" TEXT,
    "frequency" TEXT,
    "therapy_start_date" DATE,
    "therapy_stop_date" DATE,
    "indication" TEXT,
    "action_taken" "ActionTaken",
    "reintroduction_reaction" "ReintroductionReaction",
    "causality_assessment" TEXT,

    CONSTRAINT "adr_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "high_alerts" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT,
    "manufacturer_id" TEXT,
    "reason" TEXT NOT NULL,
    "flagged_by" TEXT NOT NULL,
    "flagged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,

    CONSTRAINT "high_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adr_amendments" (
    "id" TEXT NOT NULL,
    "adr_report_id" TEXT NOT NULL,
    "adr_medication_id" TEXT,
    "field_name" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT NOT NULL,
    "edited_by" TEXT NOT NULL,
    "edited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adr_amendments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE INDEX "users_hospital_id_idx" ON "users"("hospital_id");

-- CreateIndex
CREATE INDEX "drug_products_name_idx" ON "drug_products"("name");

-- CreateIndex
CREATE INDEX "manufacturers_name_idx" ON "manufacturers"("name");

-- CreateIndex
CREATE INDEX "batches_batch_no_idx" ON "batches"("batch_no");

-- CreateIndex
CREATE INDEX "batches_manufacturer_id_idx" ON "batches"("manufacturer_id");

-- CreateIndex
CREATE UNIQUE INDEX "batches_product_id_manufacturer_id_batch_no_key" ON "batches"("product_id", "manufacturer_id", "batch_no");

-- CreateIndex
CREATE UNIQUE INDEX "adr_reports_local_uuid_key" ON "adr_reports"("local_uuid");

-- CreateIndex
CREATE INDEX "adr_reports_reaction_start_date_idx" ON "adr_reports"("reaction_start_date");

-- CreateIndex
CREATE INDEX "adr_reports_reporter_user_id_idx" ON "adr_reports"("reporter_user_id");

-- CreateIndex
CREATE INDEX "adr_reports_status_idx" ON "adr_reports"("status");

-- CreateIndex
CREATE INDEX "adr_medications_batch_id_idx" ON "adr_medications"("batch_id");

-- CreateIndex
CREATE INDEX "adr_medications_adr_report_id_idx" ON "adr_medications"("adr_report_id");

-- CreateIndex
CREATE INDEX "high_alerts_batch_id_active_idx" ON "high_alerts"("batch_id", "active");

-- CreateIndex
CREATE INDEX "high_alerts_manufacturer_id_active_idx" ON "high_alerts"("manufacturer_id", "active");

-- CreateIndex
CREATE INDEX "adr_amendments_adr_report_id_idx" ON "adr_amendments"("adr_report_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "drug_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adr_reports" ADD CONSTRAINT "adr_reports_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adr_reports" ADD CONSTRAINT "adr_reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adr_medications" ADD CONSTRAINT "adr_medications_adr_report_id_fkey" FOREIGN KEY ("adr_report_id") REFERENCES "adr_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adr_medications" ADD CONSTRAINT "adr_medications_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "high_alerts" ADD CONSTRAINT "high_alerts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "high_alerts" ADD CONSTRAINT "high_alerts_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "high_alerts" ADD CONSTRAINT "high_alerts_flagged_by_fkey" FOREIGN KEY ("flagged_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "high_alerts" ADD CONSTRAINT "high_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adr_amendments" ADD CONSTRAINT "adr_amendments_adr_report_id_fkey" FOREIGN KEY ("adr_report_id") REFERENCES "adr_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adr_amendments" ADD CONSTRAINT "adr_amendments_adr_medication_id_fkey" FOREIGN KEY ("adr_medication_id") REFERENCES "adr_medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adr_amendments" ADD CONSTRAINT "adr_amendments_edited_by_fkey" FOREIGN KEY ("edited_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
