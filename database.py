import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'adrconnect.db')

def get_db_connection():
    """Return a connection to SQLite database with foreign keys and Row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create all tables and performance indexes for ADRConnect."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Hospitals Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        city TEXT NOT NULL,
        state TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('nurse', 'adr_head', 'admin')),
        hospital_id INTEGER REFERENCES hospitals(id),
        ward TEXT,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Drug Products Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        generic_name TEXT,
        dosage_form TEXT,
        strength TEXT,
        therapeutic_class TEXT,
        is_high_alert INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Manufacturers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS manufacturers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT,
        country TEXT,
        is_high_alert INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Batches Table (Drug -> Manufacturer -> Batch)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug_id INTEGER NOT NULL REFERENCES drugs(id) ON DELETE RESTRICT,
        manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id) ON DELETE RESTRICT,
        batch_number TEXT NOT NULL,
        mfg_date DATE,
        expiry_date DATE,
        is_high_alert INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(drug_id, manufacturer_id, batch_number)
    );
    """)

    # ADR Reports Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS adr_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_number TEXT UNIQUE NOT NULL,
        hospital_id INTEGER REFERENCES hospitals(id),
        reporter_id INTEGER NOT NULL REFERENCES users(id),
        patient_initials TEXT NOT NULL,
        patient_age INTEGER,
        patient_sex TEXT,
        patient_weight REAL,
        reaction_symptoms TEXT NOT NULL,
        reaction_severity TEXT NOT NULL CHECK(reaction_severity IN ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING')),
        reaction_onset TEXT,
        reaction_outcome TEXT CHECK(reaction_outcome IN ('RECOVERED', 'RECOVERING', 'NOT_RECOVERED', 'FATAL', 'UNKNOWN')),
        clinical_notes TEXT,
        submission_status TEXT NOT NULL CHECK(submission_status IN ('DRAFT', 'PARTIAL', 'COMPLETE')),
        is_read_only INTEGER DEFAULT 0,
        parent_adr_id INTEGER REFERENCES adr_reports(id),
        ward TEXT,
        signature_confirmed INTEGER DEFAULT 0,
        causality_assessment TEXT CHECK(causality_assessment IN ('CERTAIN', 'PROBABLE', 'POSSIBLE', 'UNLIKELY', 'CONDITIONAL', 'UNCLASSIFIABLE') OR causality_assessment IS NULL),
        action_taken TEXT CHECK(action_taken IN ('DRUG_WITHDRAWN', 'DOSE_REDUCED', 'DOSE_NOT_CHANGED', 'DOSE_INCREASED', 'NOT_APPLICABLE') OR action_taken IS NULL),
        clinical_review_outcome TEXT,
        clinical_review_notes TEXT,
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        sync_status TEXT DEFAULT 'SYNCED',
        client_temp_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # ADR Medications Table (Supports multiple suspected drugs per ADR)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS adr_medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        adr_id INTEGER NOT NULL REFERENCES adr_reports(id) ON DELETE CASCADE,
        drug_id INTEGER NOT NULL REFERENCES drugs(id),
        manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
        batch_id INTEGER NOT NULL REFERENCES batches(id),
        is_suspected INTEGER DEFAULT 1,
        route TEXT,
        dosage TEXT,
        start_date DATE,
        stop_date DATE,
        indication TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # High Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS high_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_type TEXT NOT NULL CHECK(target_type IN ('DRUG', 'MANUFACTURER', 'BATCH')),
        target_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        note TEXT,
        is_active INTEGER DEFAULT 1,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Safety Actions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS safety_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL CHECK(action_type IN ('STOP_USAGE', 'USE_CAUTIOUSLY', 'USE_WITHIN_LIMITS', 'CONTINUE_NORMAL_USE')),
        drug_id INTEGER NOT NULL REFERENCES drugs(id),
        manufacturer_id INTEGER REFERENCES manufacturers(id),
        batch_id INTEGER REFERENCES batches(id),
        priority TEXT NOT NULL CHECK(priority IN ('HIGH', 'MEDIUM', 'LOW')),
        reason TEXT NOT NULL,
        instructions TEXT NOT NULL,
        remarks TEXT,
        related_adr_ids TEXT,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Administrator Tasks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_number TEXT UNIQUE NOT NULL,
        safety_action_id INTEGER NOT NULL REFERENCES safety_actions(id),
        drug_id INTEGER NOT NULL REFERENCES drugs(id),
        manufacturer_id INTEGER REFERENCES manufacturers(id),
        batch_id INTEGER REFERENCES batches(id),
        action_type TEXT NOT NULL,
        priority TEXT NOT NULL,
        reason TEXT NOT NULL,
        instructions TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
        completion_remarks TEXT,
        completed_by INTEGER REFERENCES users(id),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # PvPI Referrals Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pvpi_referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referral_number TEXT UNIQUE NOT NULL,
        drug_id INTEGER NOT NULL REFERENCES drugs(id),
        manufacturer_id INTEGER REFERENCES manufacturers(id),
        batch_id INTEGER REFERENCES batches(id),
        reason TEXT NOT NULL,
        clinical_observations TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('PENDING', 'SENT', 'UNDER_REVIEW', 'COMPLETED')),
        submitted_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # PvPI Referral ADRs Association
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pvpi_referral_adrs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referral_id INTEGER NOT NULL REFERENCES pvpi_referrals(id) ON DELETE CASCADE,
        adr_id INTEGER NOT NULL REFERENCES adr_reports(id),
        UNIQUE(referral_id, adr_id)
    );
    """)

    # Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        user_name TEXT,
        role TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        role TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Safety Notices & Bulletins (Hospital-wide Alert Distribution System)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS safety_notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notice_number TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        severity TEXT NOT NULL CHECK(severity IN ('CRITICAL', 'HIGH_ALERT', 'WARNING', 'INFORMATIONAL')),
        drug_id INTEGER REFERENCES drugs(id),
        batch_id INTEGER REFERENCES batches(id),
        target_wards TEXT,
        content TEXT NOT NULL,
        action_instructions TEXT,
        created_by INTEGER REFERENCES users(id),
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Performance & Traceability Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_adr_reports_reporter ON adr_reports(reporter_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_adr_reports_status ON adr_reports(submission_status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_adr_reports_severity ON adr_reports(reaction_severity);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_adr_reports_created ON adr_reports(created_at);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_adr_reports_parent ON adr_reports(parent_adr_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_adr_meds_drug ON adr_medications(drug_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_adr_meds_batch ON adr_medications(batch_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_adr_meds_mfg ON adr_medications(manufacturer_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_admin_tasks_status ON admin_tasks(status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_admin_tasks_drug_batch ON admin_tasks(drug_id, batch_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_high_alerts_target ON high_alerts(target_type, target_id, is_active);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_batches_drug_mfg ON batches(drug_id, manufacturer_id);")

    conn.commit()
    conn.close()

def log_audit(conn, user_id, user_name, role, action, entity_type, entity_id, details=None):
    """Convenience helper to record an immutable audit entry."""
    details_str = json.dumps(details) if details is not None else None
    conn.execute("""
        INSERT INTO audit_logs (user_id, user_name, role, action, entity_type, entity_id, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, user_name, role, action, entity_type, entity_id, details_str))

def create_notification(conn, role, title, message, link=None, user_id=None):
    """Add an in-app notification for a specific role or user."""
    conn.execute("""
        INSERT INTO notifications (user_id, role, title, message, link)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, role, title, message, link))
