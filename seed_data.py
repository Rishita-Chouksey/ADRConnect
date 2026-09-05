import json
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash
from database import get_db_connection, init_db, log_audit, create_notification

def seed_database():
    """Seed ADRConnect with realistic clinical pharmacovigilance data."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing data to ensure clean idempotency
    cursor.execute("DELETE FROM notifications;")
    cursor.execute("DELETE FROM audit_logs;")
    cursor.execute("DELETE FROM pvpi_referral_adrs;")
    cursor.execute("DELETE FROM pvpi_referrals;")
    cursor.execute("DELETE FROM admin_tasks;")
    cursor.execute("DELETE FROM safety_actions;")
    cursor.execute("DELETE FROM high_alerts;")
    cursor.execute("DELETE FROM adr_medications;")
    cursor.execute("DELETE FROM adr_reports;")
    cursor.execute("DELETE FROM batches;")
    cursor.execute("DELETE FROM manufacturers;")
    cursor.execute("DELETE FROM drugs;")
    cursor.execute("DELETE FROM users;")
    cursor.execute("DELETE FROM hospitals;")
    # Reset SQLite autoincrement sequence counters
    cursor.execute("DELETE FROM sqlite_sequence;")
    conn.commit()

    print("Populating Hospital...")
    cursor.execute("""
        INSERT INTO hospitals (name, code, city, state)
        VALUES ('City General Hospital', 'CGH-01', 'Metro Health District', 'Delhi NCR')
    """)
    hospital_id = cursor.lastrowid

    print("Populating Users...")
    default_pw_hash = generate_password_hash('demo123')
    
    users_data = [
        ('Nurse Priya Sharma', 'nurse1@adrconnect.demo', default_pw_hash, 'nurse', hospital_id, 'ICU - Bed 12', '+91 98110 12001'),
        ('Nurse Ananya Sen', 'nurse2@adrconnect.demo', default_pw_hash, 'nurse', hospital_id, 'Oncology Ward', '+91 98110 12002'),
        ('Nurse Rajesh Kumar', 'nurse3@adrconnect.demo', default_pw_hash, 'nurse', hospital_id, 'Emergency Dept', '+91 98110 12003'),
        ('Nurse Sunita Patil', 'nurse4@adrconnect.demo', default_pw_hash, 'nurse', hospital_id, 'General Medicine 4B', '+91 98110 12004'),
        ('Nurse Deepa Nair', 'nurse5@adrconnect.demo', default_pw_hash, 'nurse', hospital_id, 'Pediatrics Ward', '+91 98110 12005'),
        ('Nurse Arun Varma', 'nurse6@adrconnect.demo', default_pw_hash, 'nurse', hospital_id, 'Surgical Step-Down', '+91 98110 12006'),
        ('Nurse Meera Joshi', 'nurse7@adrconnect.demo', default_pw_hash, 'nurse', hospital_id, 'Dialysis Unit', '+91 98110 12007'),
        ('Dr. Vikram Malhotra', 'adrhead@adrconnect.demo', default_pw_hash, 'adr_head', hospital_id, 'Pharmacovigilance Committee', '+91 98110 99001'),
        ('Suresh Patel', 'admin@adrconnect.demo', default_pw_hash, 'admin', hospital_id, 'Central Pharmacy Operations', '+91 98110 88001')
    ]

    user_ids = {}
    for name, email, pw, role, hosp_id, ward, phone in users_data:
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, hospital_id, ward, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (name, email, pw, role, hosp_id, ward, phone))
        user_ids[email] = cursor.lastrowid

    print("Populating Manufacturers...")
    mfg_data = [
        ('PharmaCare Life Sciences', 'PCLS', 'India'),
        ('Apex Healthcare Ltd', 'APEX', 'India'),
        ('BioGen Formulations', 'BGF', 'India'),
        ('Horizon Parenterals', 'HP', 'India')
    ]
    mfg_ids = {}
    for name, code, country in mfg_data:
        cursor.execute("""
            INSERT INTO manufacturers (name, code, country)
            VALUES (?, ?, ?)
        """, (name, code, country))
        mfg_ids[name] = cursor.lastrowid

    print("Populating Drugs...")
    drug_data = [
        ('Dextrose 5D', '5% Dextrose Infusion', 'IV Infusion', '500 ml bottle', 'Carbohydrate electrolyte replacement'),
        ('Cefotaxime 1g Inj', 'Cefotaxime Sodium', 'Injection', '1000 mg vial', 'Third-generation cephalosporin antibiotic'),
        ('Pantoprazole 40mg Inj', 'Pantoprazole Sodium', 'Lyophilized Powder', '40 mg vial', 'Proton pump inhibitor'),
        ('Paracetamol 100ml IV', 'Paracetamol IV Infusion', 'IV Infusion', '1000 mg / 100 ml', 'Analgesic and antipyretic'),
        ('Tramadol 50mg Inj', 'Tramadol Hydrochloride', 'Injection', '50 mg / 1 ml ampoule', 'Synthetic opioid analgesic')
    ]
    drug_ids = {}
    for name, gen, form, strength, th_class in drug_data:
        cursor.execute("""
            INSERT INTO drugs (name, generic_name, dosage_form, strength, therapeutic_class)
            VALUES (?, ?, ?, ?, ?)
        """, (name, gen, form, strength, th_class))
        drug_ids[name] = cursor.lastrowid

    print("Populating Batches...")
    batch_data = [
        # Dextrose 5D batches
        (drug_ids['Dextrose 5D'], mfg_ids['PharmaCare Life Sciences'], 'DX5-2401', '2025-01-10', '2027-06-30', 0),
        (drug_ids['Dextrose 5D'], mfg_ids['PharmaCare Life Sciences'], 'DX5-2402', '2025-02-15', '2027-08-31', 0),
        (drug_ids['Dextrose 5D'], mfg_ids['Apex Healthcare Ltd'], 'DX5-2403', '2025-01-05', '2027-05-15', 0),
        # Cefotaxime batches
        (drug_ids['Cefotaxime 1g Inj'], mfg_ids['Apex Healthcare Ltd'], 'CTX-2408', '2024-11-20', '2026-12-31', 1), # Marked high alert
        (drug_ids['Cefotaxime 1g Inj'], mfg_ids['BioGen Formulations'], 'CTX-2409', '2025-03-01', '2027-03-31', 0),
        # Pantoprazole batch
        (drug_ids['Pantoprazole 40mg Inj'], mfg_ids['BioGen Formulations'], 'PAN-2415', '2025-04-10', '2027-10-31', 0),
        # Paracetamol batch
        (drug_ids['Paracetamol 100ml IV'], mfg_ids['PharmaCare Life Sciences'], 'PCM-2450', '2025-03-25', '2027-09-30', 0),
        # Tramadol batch
        (drug_ids['Tramadol 50mg Inj'], mfg_ids['Horizon Parenterals'], 'TRM-2390', '2024-10-15', '2026-11-30', 0)
    ]
    batch_ids = {}
    for d_id, m_id, b_num, mfg_d, exp_d, ha in batch_data:
        cursor.execute("""
            INSERT INTO batches (drug_id, manufacturer_id, batch_number, mfg_date, expiry_date, is_high_alert)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (d_id, m_id, b_num, mfg_d, exp_d, ha))
        batch_ids[b_num] = cursor.lastrowid

    now = datetime.now()

    print("Populating High Alert for Cefotaxime batch CTX-2408...")
    cursor.execute("""
        INSERT INTO high_alerts (target_type, target_id, reason, note, is_active, created_by, created_at)
        VALUES ('BATCH', ?, 'Severe acute hypersensitivity & bronchospasm clusters', 'Quarantine immediately from pharmacy and satellite stock', 1, ?, ?)
    """, (batch_ids['CTX-2408'], user_ids['adrhead@adrconnect.demo'], (now - timedelta(days=2)).isoformat()))

    print("Populating 12 ADR Reports for Dextrose 5D (Spec Requirement)...")
    # Specifications:
    # 12 ADR reports
    # 7 different Nurses: Priya (3), Ananya (2), Rajesh (2), Sunita (2), Deepa (1), Arun (1), Meera (1)
    # 12 affected patients
    # Severity: exactly 3 Severe, 6 Moderate, 3 Mild
    # Reaction: Shivering in exactly 8 reports: (1, 2, 3, 5, 6, 8, 10, 11)
    # Increasing complaint trend over past 30 days
    
    dextrose_reports = [
        # Report 1: Mild, Shivering (1), Sunita Patil, 28 days ago, Batch DX5-2401
        {
            'rep_num': 'ADR-2026-001', 'reporter': 'nurse4@adrconnect.demo', 'ward': 'General Medicine 4B',
            'init': 'R.K.', 'age': 45, 'sex': 'Male', 'weight': 68.0,
            'symptoms': ['Shivering', 'Cold Clammy Skin'], 'severity': 'MILD', 'onset': '20 minutes into IV infusion',
            'outcome': 'RECOVERED', 'notes': 'Infusion slowed; patient covered with warm blankets. Shivering resolved.',
            'status': 'COMPLETE', 'days_ago': 28, 'batch': 'DX5-2401', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'PROBABLE', 'action': 'DOSE_REDUCED'
        },
        # Report 2: Moderate, Shivering (2), Rajesh Kumar, 24 days ago, Batch DX5-2402
        {
            'rep_num': 'ADR-2026-002', 'reporter': 'nurse3@adrconnect.demo', 'ward': 'Emergency Dept',
            'init': 'M.S.', 'age': 52, 'sex': 'Female', 'weight': 60.0,
            'symptoms': ['Shivering', 'Fever', 'Tachycardia'], 'severity': 'MODERATE', 'onset': '15 minutes after start',
            'outcome': 'RECOVERING', 'notes': 'Temp spiked to 101.4F with rigors. Infusion stopped.',
            'status': 'COMPLETE', 'days_ago': 24, 'batch': 'DX5-2402', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'PROBABLE', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 3: Severe, Shivering (3), Priya Sharma, 20 days ago, Batch DX5-2401
        {
            'rep_num': 'ADR-2026-003', 'reporter': 'nurse1@adrconnect.demo', 'ward': 'ICU - Bed 12',
            'init': 'S.P.', 'age': 38, 'sex': 'Male', 'weight': 74.0,
            'symptoms': ['Shivering', 'High Grade Fever', 'Hypotension', 'Rigors'], 'severity': 'SEVERE', 'onset': '10 minutes into infusion',
            'outcome': 'RECOVERED', 'notes': 'BP dropped to 85/55 mmHg with violent shivering. Responded to IV hydrocortisone and fluid bolus.',
            'status': 'COMPLETE', 'days_ago': 20, 'batch': 'DX5-2401', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'CERTAIN', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 4: Moderate, No shivering (Fever, Nausea), Deepa Nair, 16 days ago, Batch DX5-2403
        {
            'rep_num': 'ADR-2026-004', 'reporter': 'nurse5@adrconnect.demo', 'ward': 'Pediatrics Ward',
            'init': 'A.G.', 'age': 61, 'sex': 'Female', 'weight': 55.0,
            'symptoms': ['Fever', 'Nausea/Vomiting', 'Headache'], 'severity': 'MODERATE', 'onset': '30 minutes into IV',
            'outcome': 'RECOVERING', 'notes': 'Profuse sweating and vomiting following pyrexial spike.',
            'status': 'COMPLETE', 'days_ago': 16, 'batch': 'DX5-2403', 'mfg': 'Apex Healthcare Ltd',
            'causality': 'POSSIBLE', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 5: Mild, Shivering (4), Ananya Sen, 13 days ago, Batch DX5-2401
        {
            'rep_num': 'ADR-2026-005', 'reporter': 'nurse2@adrconnect.demo', 'ward': 'Oncology Ward',
            'init': 'V.N.', 'age': 29, 'sex': 'Male', 'weight': 80.0,
            'symptoms': ['Shivering', 'Restlessness'], 'severity': 'MILD', 'onset': '15 minutes into drip',
            'outcome': 'RECOVERED', 'notes': 'Mild chill and shivering. Stopped infusion and replaced bottle with normal saline.',
            'status': 'COMPLETE', 'days_ago': 13, 'batch': 'DX5-2401', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'PROBABLE', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 6: Moderate, Shivering (5), Arun Varma, 10 days ago, Batch DX5-2401
        {
            'rep_num': 'ADR-2026-006', 'reporter': 'nurse6@adrconnect.demo', 'ward': 'Surgical Step-Down',
            'init': 'K.T.', 'age': 70, 'sex': 'Female', 'weight': 50.0,
            'symptoms': ['Shivering', 'Fever', 'Dyspnea'], 'severity': 'MODERATE', 'onset': '10 minutes after start',
            'outcome': 'RECOVERING', 'notes': 'Post-op patient developed sudden rigors and shivering with mild breathlessness.',
            'status': 'COMPLETE', 'days_ago': 10, 'batch': 'DX5-2401', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'PROBABLE', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 7: Moderate, No shivering (Fever, Flushing), Priya Sharma, 7 days ago, Batch DX5-2402
        {
            'rep_num': 'ADR-2026-007', 'reporter': 'nurse1@adrconnect.demo', 'ward': 'ICU - Bed 12',
            'init': 'P.B.', 'age': 42, 'sex': 'Male', 'weight': 72.0,
            'symptoms': ['Fever', 'Facial Flushing', 'Tachycardia'], 'severity': 'MODERATE', 'onset': '25 minutes into infusion',
            'outcome': 'RECOVERED', 'notes': 'Heart rate increased to 124 bpm with facial flushing.',
            'status': 'COMPLETE', 'days_ago': 7, 'batch': 'DX5-2402', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'PROBABLE', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 8: Severe, Shivering (6), Meera Joshi, 5 days ago, Batch DX5-2401
        {
            'rep_num': 'ADR-2026-008', 'reporter': 'nurse7@adrconnect.demo', 'ward': 'Dialysis Unit',
            'init': 'L.M.', 'age': 33, 'sex': 'Female', 'weight': 58.0,
            'symptoms': ['Shivering', 'Rigors', 'Severe Cyanosis', 'Hypotension'], 'severity': 'SEVERE', 'onset': '8 minutes into infusion',
            'outcome': 'RECOVERING', 'notes': 'Peripheral cyanosis and extreme shivering. Critical nursing intervention required.',
            'status': 'COMPLETE', 'days_ago': 5, 'batch': 'DX5-2401', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'CERTAIN', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 9: Mild, No shivering (Urticaria, Pruritus), Sunita Patil, 4 days ago, Batch DX5-2402
        {
            'rep_num': 'ADR-2026-009', 'reporter': 'nurse4@adrconnect.demo', 'ward': 'General Medicine 4B',
            'init': 'D.S.', 'age': 57, 'sex': 'Male', 'weight': 65.0,
            'symptoms': ['Rash / Urticaria', 'Pruritus'], 'severity': 'MILD', 'onset': '40 minutes into infusion',
            'outcome': 'RECOVERED', 'notes': 'Transient erythematous hives on forearms.',
            'status': 'COMPLETE', 'days_ago': 4, 'batch': 'DX5-2402', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'POSSIBLE', 'action': 'DOSE_REDUCED'
        },
        # Report 10: Moderate, Shivering (7), Rajesh Kumar, 3 days ago, Batch DX5-2401
        {
            'rep_num': 'ADR-2026-010', 'reporter': 'nurse3@adrconnect.demo', 'ward': 'Emergency Dept',
            'init': 'H.R.', 'age': 64, 'sex': 'Female', 'weight': 62.0,
            'symptoms': ['Shivering', 'Chills', 'Nausea/Vomiting'], 'severity': 'MODERATE', 'onset': '12 minutes into infusion',
            'outcome': 'NOT_RECOVERED', 'notes': 'Patient still experiencing episodic chills. Admitted for observation.',
            'status': 'PARTIAL', 'days_ago': 3, 'batch': 'DX5-2401', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'PROBABLE', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 11: Severe, Shivering (8), Priya Sharma, 2 days ago, Batch DX5-2401
        {
            'rep_num': 'ADR-2026-011', 'reporter': 'nurse1@adrconnect.demo', 'ward': 'ICU - Bed 12',
            'init': 'N.J.', 'age': 49, 'sex': 'Male', 'weight': 70.0,
            'symptoms': ['Shivering', 'Rigors', 'High Grade Fever', 'Tachycardia'], 'severity': 'SEVERE', 'onset': '10 minutes into infusion',
            'outcome': 'RECOVERING', 'notes': 'Violent chills and heart rate 130 bpm. Suspected endotoxin/pyrogen contamination.',
            'status': 'COMPLETE', 'days_ago': 2, 'batch': 'DX5-2401', 'mfg': 'PharmaCare Life Sciences',
            'causality': 'CERTAIN', 'action': 'DRUG_WITHDRAWN'
        },
        # Report 12: Moderate, No shivering (Tremor, Headache), Ananya Sen, 1 day ago, Batch DX5-2401
        {
            'rep_num': 'ADR-2026-012', 'reporter': 'nurse2@adrconnect.demo', 'ward': 'Oncology Ward',
            'init': 'T.C.', 'age': 36, 'sex': 'Female', 'weight': 54.0,
            'symptoms': ['Tremor', 'Headache', 'Dizziness'], 'severity': 'MODERATE', 'onset': '15 minutes into drip',
            'outcome': 'NOT_RECOVERED', 'notes': 'Discomfort ongoing, under antipyretic cover. Awaiting lab blood culture.',
            'status': 'PARTIAL', 'days_ago': 1, 'batch': 'DX5-2401', 'mfg': 'PharmaCare Life Sciences',
            'causality': None, 'action': None
        }
    ]

    inserted_dextrose_adr_ids = []

    for r in dextrose_reports:
        created_dt = now - timedelta(days=r['days_ago'], hours=3)
        cursor.execute("""
            INSERT INTO adr_reports (
                report_number, hospital_id, reporter_id, patient_initials, patient_age,
                patient_sex, patient_weight, reaction_symptoms, reaction_severity,
                reaction_onset, reaction_outcome, clinical_notes, submission_status,
                is_read_only, ward, signature_confirmed, causality_assessment,
                action_taken, clinical_review_notes, reviewed_by, reviewed_at,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r['rep_num'], hospital_id, user_ids[r['reporter']], r['init'], r['age'],
            r['sex'], r['weight'], json.dumps(r['symptoms']), r['severity'],
            r['onset'], r['outcome'], r['notes'], r['status'],
            1 if r['status'] == 'COMPLETE' else 0, r['ward'],
            r.get('causality'), r.get('action'),
            "Clinical assessment by ADR Head: Pyrogenic reaction suspected." if r.get('causality') else None,
            user_ids['adrhead@adrconnect.demo'] if r.get('causality') else None,
            (created_dt + timedelta(hours=4)).isoformat() if r.get('causality') else None,
            created_dt.isoformat(), created_dt.isoformat()
        ))
        adr_id = cursor.lastrowid
        inserted_dextrose_adr_ids.append(adr_id)

        # Medication association
        cursor.execute("""
            INSERT INTO adr_medications (adr_id, drug_id, manufacturer_id, batch_id, is_suspected, route, dosage)
            VALUES (?, ?, ?, ?, 1, 'IV Infusion', '500ml @ 30 drops/min')
        """, (adr_id, drug_ids['Dextrose 5D'], mfg_ids[r['mfg']], batch_ids[r['batch']]))

    print("Populating Follow-up Report for ADR-2026-010...")
    # Follow-up for patient H.R. (ADR-2026-010, inserted_dextrose_adr_ids[9])
    parent_id = inserted_dextrose_adr_ids[9]
    fu_time = now - timedelta(days=1, hours=2)
    cursor.execute("""
        INSERT INTO adr_reports (
            report_number, hospital_id, reporter_id, patient_initials, patient_age,
            patient_sex, patient_weight, reaction_symptoms, reaction_severity,
            reaction_onset, reaction_outcome, clinical_notes, submission_status,
            is_read_only, parent_adr_id, ward, signature_confirmed, causality_assessment,
            action_taken, created_at, updated_at
        ) VALUES (
            'ADR-2026-010-FU1', ?, ?, 'H.R.', 64, 'Female', 62.0,
            ?, 'MODERATE', 'Follow-up at 48 hours post-infusion', 'RECOVERED',
            'Follow-up update: Chills fully subsided after oral paracetamol and hydration. Patient discharged.',
            'COMPLETE', 1, ?, 'Emergency Dept', 1, 'PROBABLE', 'DRUG_WITHDRAWN', ?, ?
        )
    """, (
        hospital_id, user_ids['nurse3@adrconnect.demo'],
        json.dumps(['Shivering', 'Chills']), parent_id,
        fu_time.isoformat(), fu_time.isoformat()
    ))
    fu_adr_id = cursor.lastrowid
    cursor.execute("""
        INSERT INTO adr_medications (adr_id, drug_id, manufacturer_id, batch_id, is_suspected, route, dosage)
        VALUES (?, ?, ?, ?, 1, 'IV Infusion', '500ml @ 30 drops/min')
    """, (fu_adr_id, drug_ids['Dextrose 5D'], mfg_ids['PharmaCare Life Sciences'], batch_ids['DX5-2401']))

    print("Populating Cefotaxime ADR Reports (High Alert Batch CTX-2408)...")
    cefotaxime_reports = [
        {
            'rep_num': 'ADR-2026-013', 'reporter': 'nurse6@adrconnect.demo', 'ward': 'Surgical Step-Down',
            'init': 'B.L.', 'age': 44, 'sex': 'Male', 'weight': 75.0,
            'symptoms': ['Anaphylaxis', 'Bronchospasm', 'Hypotension'], 'severity': 'LIFE_THREATENING',
            'onset': '3 minutes post slow IV injection', 'outcome': 'RECOVERING',
            'notes': 'Sudden stridor, acute airway compromise. Resuscitated with IM Epinephrine 0.5mg.',
            'batch': 'CTX-2408', 'days_ago': 3
        },
        {
            'rep_num': 'ADR-2026-014', 'reporter': 'nurse1@adrconnect.demo', 'ward': 'ICU - Bed 12',
            'init': 'C.M.', 'age': 59, 'sex': 'Female', 'weight': 64.0,
            'symptoms': ['Rash / Urticaria', 'Angioedema', 'Dyspnea'], 'severity': 'SEVERE',
            'onset': '5 minutes post injection', 'outcome': 'RECOVERED',
            'notes': 'Facial edema and generalised wheal eruptions.',
            'batch': 'CTX-2408', 'days_ago': 2
        },
        {
            'rep_num': 'ADR-2026-015', 'reporter': 'nurse4@adrconnect.demo', 'ward': 'General Medicine 4B',
            'init': 'K.R.', 'age': 50, 'sex': 'Male', 'weight': 82.0,
            'symptoms': ['Rash / Urticaria', 'Pruritus'], 'severity': 'MODERATE',
            'onset': '10 minutes post IV bolus', 'outcome': 'RECOVERED',
            'notes': 'Intense itching and maculopapular rash on chest.',
            'batch': 'CTX-2408', 'days_ago': 2
        },
        {
            'rep_num': 'ADR-2026-016', 'reporter': 'nurse3@adrconnect.demo', 'ward': 'Emergency Dept',
            'init': 'J.D.', 'age': 32, 'sex': 'Female', 'weight': 57.0,
            'symptoms': ['Bronchospasm', 'Tachycardia'], 'severity': 'SEVERE',
            'onset': 'Immediate post-administration', 'outcome': 'RECOVERING',
            'notes': 'Acute wheeze; required nebulised salbutamol and IV hydrocortisone.',
            'batch': 'CTX-2408', 'days_ago': 1
        }
    ]
    cefotaxime_adr_ids = []
    for cr in cefotaxime_reports:
        c_time = now - timedelta(days=cr['days_ago'], hours=1)
        cursor.execute("""
            INSERT INTO adr_reports (
                report_number, hospital_id, reporter_id, patient_initials, patient_age,
                patient_sex, patient_weight, reaction_symptoms, reaction_severity,
                reaction_onset, reaction_outcome, clinical_notes, submission_status,
                is_read_only, ward, signature_confirmed, causality_assessment, action_taken,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETE', 1, ?, 1, 'CERTAIN', 'DRUG_WITHDRAWN', ?, ?)
        """, (
            cr['rep_num'], hospital_id, user_ids[cr['reporter']], cr['init'], cr['age'],
            cr['sex'], cr['weight'], json.dumps(cr['symptoms']), cr['severity'],
            cr['onset'], cr['outcome'], cr['notes'], cr['ward'], c_time.isoformat(), c_time.isoformat()
        ))
        c_adr_id = cursor.lastrowid
        cefotaxime_adr_ids.append(c_adr_id)
        cursor.execute("""
            INSERT INTO adr_medications (adr_id, drug_id, manufacturer_id, batch_id, is_suspected, route, dosage)
            VALUES (?, ?, ?, ?, 1, 'IV Injection', '1g reconstituted in 10ml WFI')
        """, (c_adr_id, drug_ids['Cefotaxime 1g Inj'], mfg_ids['Apex Healthcare Ltd'], batch_ids[cr['batch']]))

    print("Populating Safety Actions and Administrator Tasks...")
    # Safety Action 1: STOP USAGE for Cefotaxime CTX-2408 (High Priority) -> Pending Admin Task
    cursor.execute("""
        INSERT INTO safety_actions (
            action_type, drug_id, manufacturer_id, batch_id, priority, reason,
            instructions, remarks, related_adr_ids, created_by, created_at
        ) VALUES (
            'STOP_USAGE', ?, ?, ?, 'HIGH',
            'Severe life-threatening anaphylactoid reactions & acute bronchospasm observed across multiple wards.',
            'Immediately quarantine all vials of batch CTX-2408 from central stores and ward crash carts. Return remaining stock to central holding.',
            'Priority 1 action. High alert status flagged. PvPI notification pending.',
            ?, ?, ?
        )
    """, (
        drug_ids['Cefotaxime 1g Inj'], mfg_ids['Apex Healthcare Ltd'], batch_ids['CTX-2408'],
        json.dumps(cefotaxime_adr_ids), user_ids['adrhead@adrconnect.demo'],
        (now - timedelta(days=1, hours=4)).isoformat()
    ))
    safety_action_1 = cursor.lastrowid

    cursor.execute("""
        INSERT INTO admin_tasks (
            task_number, safety_action_id, drug_id, manufacturer_id, batch_id,
            action_type, priority, reason, instructions, status, created_at, updated_at
        ) VALUES (
            'TASK-2026-001', ?, ?, ?, ?, 'STOP_USAGE', 'HIGH',
            'Severe life-threatening anaphylactoid reactions & acute bronchospasm observed across multiple wards.',
            'Immediately quarantine all vials of batch CTX-2408 from central stores and ward crash carts. Return remaining stock to central holding.',
            'PENDING', ?, ?
        )
    """, (
        safety_action_1, drug_ids['Cefotaxime 1g Inj'], mfg_ids['Apex Healthcare Ltd'], batch_ids['CTX-2408'],
        (now - timedelta(days=1, hours=4)).isoformat(), (now - timedelta(days=1, hours=4)).isoformat()
    ))

    # Safety Action 2: USE CAUTIOUSLY for Dextrose 5D DX5-2401 -> In Progress Admin Task
    cursor.execute("""
        INSERT INTO safety_actions (
            action_type, drug_id, manufacturer_id, batch_id, priority, reason,
            instructions, remarks, related_adr_ids, created_by, created_at
        ) VALUES (
            'USE_CAUTIOUSLY', ?, ?, ?, 'MEDIUM',
            'Cluster of pyrogenic/shivering reactions reported by 7 different nurses.',
            'Inspect IV infusion bottles for particulate turbidity before issuing. Dispense with 0.22 micron IV in-line filter where possible.',
            'Monitoring trend closely. Do not withdraw full batch yet, but restrict to ICU and high-observation beds.',
            ?, ?, ?
        )
    """, (
        drug_ids['Dextrose 5D'], mfg_ids['PharmaCare Life Sciences'], batch_ids['DX5-2401'],
        json.dumps(inserted_dextrose_adr_ids[:8]), user_ids['adrhead@adrconnect.demo'],
        (now - timedelta(days=2)).isoformat()
    ))
    safety_action_2 = cursor.lastrowid

    cursor.execute("""
        INSERT INTO admin_tasks (
            task_number, safety_action_id, drug_id, manufacturer_id, batch_id,
            action_type, priority, reason, instructions, status, created_at, updated_at
        ) VALUES (
            'TASK-2026-002', ?, ?, ?, ?, 'USE_CAUTIOUSLY', 'MEDIUM',
            'Cluster of pyrogenic/shivering reactions reported by 7 different nurses.',
            'Inspect IV infusion bottles for particulate turbidity before issuing. Dispense with 0.22 micron IV in-line filter where possible.',
            'IN_PROGRESS', ?, ?
        )
    """, (
        safety_action_2, drug_ids['Dextrose 5D'], mfg_ids['PharmaCare Life Sciences'], batch_ids['DX5-2401'],
        (now - timedelta(days=2)).isoformat(), (now - timedelta(hours=18)).isoformat()
    ))

    # Safety Action 3: Historical Completed Task for Tramadol TRM-2390
    cursor.execute("""
        INSERT INTO safety_actions (
            action_type, drug_id, manufacturer_id, batch_id, priority, reason,
            instructions, remarks, created_by, created_at
        ) VALUES (
            'USE_WITHIN_LIMITS', ?, ?, ?, 'LOW',
            'Packaging label font discrepancy on ampoules.',
            'Verify ampoule concentration (50mg/ml) prior to dispensing. Do not mix with 100mg stock.',
            'Resolved with manufacturer QA team.',
            ?, ?
        )
    """, (
        drug_ids['Tramadol 50mg Inj'], mfg_ids['Horizon Parenterals'], batch_ids['TRM-2390'],
        user_ids['adrhead@adrconnect.demo'], (now - timedelta(days=15)).isoformat()
    ))
    safety_action_3 = cursor.lastrowid

    cursor.execute("""
        INSERT INTO admin_tasks (
            task_number, safety_action_id, drug_id, manufacturer_id, batch_id,
            action_type, priority, reason, instructions, status,
            completion_remarks, completed_by, completed_at, created_at, updated_at
        ) VALUES (
            'TASK-2026-003', ?, ?, ?, ?, 'USE_WITHIN_LIMITS', 'LOW',
            'Packaging label font discrepancy on ampoules.',
            'Verify ampoule concentration (50mg/ml) prior to dispensing. Do not mix with 100mg stock.',
            'COMPLETED',
            'All satellite stock verified. Pharmacists instructed on barcode scanning and dosage verification. Completed without incident.',
            ?, ?, ?, ?
        )
    """, (
        safety_action_3, drug_ids['Tramadol 50mg Inj'], mfg_ids['Horizon Parenterals'], batch_ids['TRM-2390'],
        user_ids['admin@adrconnect.demo'], (now - timedelta(days=12)).isoformat(),
        (now - timedelta(days=15)).isoformat(), (now - timedelta(days=12)).isoformat()
    ))

    print("Populating PvPI Referral for Cefotaxime...")
    cursor.execute("""
        INSERT INTO pvpi_referrals (
            referral_number, drug_id, manufacturer_id, batch_id, reason,
            clinical_observations, status, submitted_by, created_at, updated_at
        ) VALUES (
            'PVPI-REF-2026-001', ?, ?, ?,
            'Acute life-threatening anaphylaxis & severe bronchospasm clustered in batch CTX-2408.',
            '4 documented severe cases within 72 hours. All patients developed acute respiratory distress and severe wheal eruptions within 3-10 minutes of administration. Suspected glass particulate or formulation impurity.',
            'UNDER_REVIEW', ?, ?, ?
        )
    """, (
        drug_ids['Cefotaxime 1g Inj'], mfg_ids['Apex Healthcare Ltd'], batch_ids['CTX-2408'],
        user_ids['adrhead@adrconnect.demo'], (now - timedelta(days=1)).isoformat(), (now - timedelta(days=1)).isoformat()
    ))
    pvpi_ref_id = cursor.lastrowid

    for cid in cefotaxime_adr_ids:
        cursor.execute("""
            INSERT INTO pvpi_referral_adrs (referral_id, adr_id)
            VALUES (?, ?)
        """, (pvpi_ref_id, cid))

    print("Populating Initial In-App Notifications...")
    create_notification(conn, 'adr_head', 'High Alert Case Filed', 'Cefotaxime 1g batch CTX-2408 has 4 severe reports. Stop Usage instruction created.', '#/tasks', user_ids['adrhead@adrconnect.demo'])
    create_notification(conn, 'admin', 'Urgent Safety Instruction', 'Stop Usage instruction received for Cefotaxime CTX-2408. Quarantine immediately.', '#/admin-tasks', user_ids['admin@adrconnect.demo'])
    create_notification(conn, 'nurse', 'Safety Advisory Active', 'Dextrose 5D batch DX5-2401 is under active caution. Check for particulate clarity.', '#/new-adr', user_ids['nurse1@adrconnect.demo'])

    # Audit log entries
    log_audit(conn, user_ids['adrhead@adrconnect.demo'], 'Dr. Vikram Malhotra', 'adr_head', 'SAFETY_ACTION_CREATED', 'safety_actions', safety_action_1, {'action': 'STOP_USAGE', 'drug': 'Cefotaxime 1g Inj', 'batch': 'CTX-2408'})
    log_audit(conn, user_ids['admin@adrconnect.demo'], 'Suresh Patel', 'admin', 'TASK_COMPLETED', 'admin_tasks', 3, {'remarks': 'All satellite stock verified and secured.'})

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
