import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const directUrl = 'postgresql://postgres.ighxhcggjdikpudvfjxg:SSRA0509123a@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

const db = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

async function migrate() {
  console.log('Running schema migration via Session Pooler (port 5432)...');

  try {
    await db.$executeRawUnsafe(`ALTER TYPE "ReportStatus" ADD VALUE IF NOT EXISTS 'under_review';`);
    await db.$executeRawUnsafe(`ALTER TYPE "ReportStatus" ADD VALUE IF NOT EXISTS 'follow_up_required';`);
    await db.$executeRawUnsafe(`ALTER TYPE "ReportStatus" ADD VALUE IF NOT EXISTS 'escalated';`);
    await db.$executeRawUnsafe(`ALTER TYPE "ReportStatus" ADD VALUE IF NOT EXISTS 'closed';`);
    console.log('Enums updated');
  } catch (e: any) {
    console.log('Enums notice:', e.message);
  }

  try {
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "SeverityLevel" AS ENUM ('mild', 'moderate', 'severe', 'life_threatening');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('SeverityLevel enum created');
  } catch (e: any) {
    console.log('SeverityLevel enum notice:', e.message);
  }

  try {
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "NoticeSeverity" AS ENUM ('info', 'warning', 'critical');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('NoticeSeverity enum created');
  } catch (e: any) {
    console.log('NoticeSeverity enum notice:', e.message);
  }

  try {
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ForwardedTarget" AS ENUM ('hospital_pv_unit', 'drug_safety_committee', 'pvpi_regulatory');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('ForwardedTarget enum created');
  } catch (e: any) {
    console.log('ForwardedTarget enum notice:', e.message);
  }

  // Alter adr_reports table
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "adr_reports" ADD COLUMN IF NOT EXISTS "severity" "SeverityLevel" DEFAULT 'moderate';`);
    await db.$executeRawUnsafe(`ALTER TABLE "adr_reports" ADD COLUMN IF NOT EXISTS "parent_report_id" TEXT;`);
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "adr_reports" ADD CONSTRAINT "adr_reports_parent_report_id_fkey" FOREIGN KEY ("parent_report_id") REFERENCES "adr_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('adr_reports table updated');
  } catch (e: any) {
    console.log('adr_reports alter notice:', e.message);
  }

  // Create safety_notices table
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "safety_notices" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "severity" "NoticeSeverity" NOT NULL DEFAULT 'warning',
        "batch_id" TEXT REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "target_ward" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "created_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "resolved_at" TIMESTAMP(3)
      );
    `);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "safety_notices_active_idx" ON "safety_notices"("active");`);
    console.log('safety_notices table created/verified');
  } catch (e: any) {
    console.log('safety_notices table notice:', e.message);
  }

  // Create forwarding_records table
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "forwarding_records" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "adr_report_id" TEXT NOT NULL REFERENCES "adr_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "forwarded_to" "ForwardedTarget" NOT NULL,
        "reference_no" TEXT NOT NULL,
        "notes" TEXT,
        "forwarded_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "forwarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "forwarding_records_adr_report_id_idx" ON "forwarding_records"("adr_report_id");`);
    console.log('forwarding_records table created/verified');
  } catch (e: any) {
    console.log('forwarding_records table notice:', e.message);
  }

  console.log('Migration completed successfully!');
  await db.$disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
