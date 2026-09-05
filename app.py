import os
import json
import sqlite3
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Flask, request, jsonify, render_template, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash
import jwt

from database import get_db_connection, log_audit, create_notification
from services.adr_service import (
    create_adr_report, submit_followup, update_clinical_review,
    get_adr_detail, check_medication_safety
)
from services.analytics_service import get_dashboard_metrics, get_drug_risk_profile
from services.safety_service import (
    set_high_alert, remove_high_alert, create_safety_action,
    update_admin_task_status, check_dispensing_safety
)
from services.pvpi_service import (
    create_pvpi_referral, list_pvpi_referrals, get_pvpi_referral_detail, update_pvpi_status
)

app = Flask(__name__, static_folder='static', static_url_path='')

ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
ALLOW_DEMO_LOGIN = os.environ.get('ALLOW_DEMO_LOGIN', 'true').lower() in ('true', '1', 'yes')

# In production, require explicit secret keys from environment; in dev, use fallback
app.secret_key = os.environ.get('FLASK_SECRET_KEY') or (
    'adrconnect_dev_secret_insecure_2026' if ENVIRONMENT != 'production' else os.urandom(32).hex()
)
JWT_SECRET = os.environ.get('JWT_SECRET') or (
    'adrconnect_jwt_dev_secret_token_2026' if ENVIRONMENT != 'production' else os.urandom(32).hex()
)


# ----------------- Security & RBAC Decorators -----------------

def get_current_user():
    """Retrieve logged-in user from Authorization Bearer header first, then session."""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = payload.get('user_id')
            if user_id:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute("SELECT id, name, email, role, hospital_id, ward, phone FROM users WHERE id = ?", (user_id,))
                user = cur.fetchone()
                conn.close()
                if user:
                    return dict(user)
        except Exception:
            pass

    user_id = session.get('user_id')
    if not user_id:
        return None

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role, hospital_id, ward, phone FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    conn.close()
    return dict(user) if user else None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def require_role(allowed_roles):
    """Enforce strict Role-Based Access Control (RBAC)."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({'error': 'Authentication required. Please log in.'}), 401
            if user['role'] not in allowed_roles:
                return jsonify({
                    'error': f"Access denied for role '{user['role']}'. Permitted roles: {', '.join(allowed_roles)}"
                }), 403
            request.current_user = user
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# ----------------- Web UI Root -----------------

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# ----------------- Auth Endpoints -----------------

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
    user = cur.fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    session['user_id'] = user['id']
    token = jwt.encode({
        'user_id': user['id'],
        'role': user['role'],
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }, JWT_SECRET, algorithm='HS256')

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'ward': user['ward'],
            'hospital_id': user['hospital_id']
        }
    })

@app.route('/api/auth/demo-switch', methods=['POST'])
def demo_switch():
    """Development/Demo account switcher. Disabled in production environments."""
    if not ALLOW_DEMO_LOGIN or ENVIRONMENT == 'production':
        return jsonify({
            'error': 'Demo switch is disabled in production mode. Please authenticate using /api/auth/login.'
        }), 403

    data = request.get_json() or {}
    role = (data.get('role') or '').lower()
    
    role_email_map = {
        'nurse': 'nurse1@adrconnect.demo',
        'adr_head': 'adrhead@adrconnect.demo',
        'admin': 'admin@adrconnect.demo'
    }

    if role not in role_email_map:
        return jsonify({'error': 'Invalid demo role requested.'}), 400

    email = role_email_map[role]
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cur.fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'Demo user not found. Please re-seed database.'}), 500

    session['user_id'] = user['id']
    token = jwt.encode({
        'user_id': user['id'],
        'role': user['role'],
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }, JWT_SECRET, algorithm='HS256')

    return jsonify({
        'message': f'Switched to demo {user["name"]} ({role})',
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'ward': user['ward'],
            'hospital_id': user['hospital_id']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = get_current_user()
    if not user:
        return jsonify({'authenticated': False}), 200
    return jsonify({'authenticated': True, 'user': user})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully.'})

# ----------------- Master Data Endpoints -----------------

@app.route('/api/drugs', methods=['GET'])
def get_drugs():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT d.*, 
               (SELECT COUNT(DISTINCT a.id) FROM adr_reports a JOIN adr_medications m ON m.adr_id = a.id WHERE m.drug_id = d.id) as total_adrs,
               (SELECT COUNT(*) FROM batches WHERE drug_id = d.id AND is_active = 1) as batches_count
        FROM drugs d
        WHERE d.is_active = 1
        ORDER BY d.name ASC
    """)
    drugs = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(drugs)

@app.route('/api/manufacturers', methods=['GET'])
def get_manufacturers():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM manufacturers WHERE is_active = 1 ORDER BY name ASC")
    mfgs = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(mfgs)

@app.route('/api/batches', methods=['GET'])
def get_batches():
    drug_id = request.args.get('drug_id')
    mfg_id = request.args.get('manufacturer_id')
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
        SELECT b.*, d.name as drug_name, m.name as manufacturer_name
        FROM batches b
        JOIN drugs d ON d.id = b.drug_id
        JOIN manufacturers m ON m.id = b.manufacturer_id
        WHERE b.is_active = 1
    """
    params = []
    if drug_id:
        query += " AND b.drug_id = ?"
        params.append(int(drug_id))
    if mfg_id:
        query += " AND b.manufacturer_id = ?"
        params.append(int(mfg_id))
    query += " ORDER BY b.batch_number ASC"

    cur.execute(query, params)
    batches = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(batches)

# ----------------- Nurse Endpoints -----------------

@app.route('/api/nurse/home', methods=['GET'])
@require_role(['nurse'])
def nurse_home():
    user = request.current_user
    conn = get_db_connection()
    cur = conn.cursor()

    # Recent reports submitted by this nurse
    cur.execute("""
        SELECT a.id, a.report_number, a.patient_initials, a.reaction_severity,
               a.reaction_outcome, a.submission_status, a.created_at,
               d.name as drug_name, b.batch_number
        FROM adr_reports a
        LEFT JOIN adr_medications m ON m.adr_id = a.id
        LEFT JOIN drugs d ON d.id = m.drug_id
        LEFT JOIN batches b ON b.id = m.batch_id
        WHERE a.reporter_id = ?
        ORDER BY a.created_at DESC LIMIT 6
    """, (user['id'],))
    recent_reports = [dict(r) for r in cur.fetchall()]

    # Drafts count
    cur.execute("SELECT COUNT(*) as cnt FROM adr_reports WHERE reporter_id = ? AND submission_status = 'DRAFT'", (user['id'],))
    drafts_count = cur.fetchone()['cnt']

    # Partial count (available for follow-up)
    cur.execute("SELECT COUNT(*) as cnt FROM adr_reports WHERE reporter_id = ? AND submission_status = 'PARTIAL'", (user['id'],))
    partial_count = cur.fetchone()['cnt']

    # Important active safety alerts for display
    cur.execute("""
        SELECT sa.action_type, sa.priority, sa.reason, sa.instructions, d.name as drug_name, b.batch_number
        FROM safety_actions sa
        JOIN drugs d ON d.id = sa.drug_id
        LEFT JOIN batches b ON b.id = sa.batch_id
        WHERE sa.priority IN ('HIGH', 'MEDIUM')
        ORDER BY sa.created_at DESC LIMIT 3
    """)
    safety_alerts = [dict(r) for r in cur.fetchall()]

    conn.close()
    return jsonify({
        'recent_reports': recent_reports,
        'drafts_count': drafts_count,
        'partial_count': partial_count,
        'safety_alerts': safety_alerts
    })

@app.route('/api/nurse/check-safety', methods=['GET'])
def nurse_check_safety():
    """
    Called live during Drug -> Manufacturer -> Batch selection in ADR Wizard.
    Returns previous ADR count and non-blocking High Alert / Caution notices.
    """
    drug_id = request.args.get('drug_id')
    mfg_id = request.args.get('manufacturer_id')
    batch_id = request.args.get('batch_id')

    if not drug_id:
        return jsonify({'error': 'drug_id is required'}), 400

    result = check_medication_safety(drug_id, mfg_id, batch_id)
    return jsonify(result)

@app.route('/api/nurse/adr', methods=['POST'])
@require_role(['nurse'])
def nurse_submit_adr():
    data = request.get_json() or {}
    user = request.current_user
    try:
        res = create_adr_report(data, user)
        return jsonify(res), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/nurse/followup', methods=['POST'])
@require_role(['nurse'])
def nurse_submit_followup():
    data = request.get_json() or {}
    user = request.current_user
    parent_id = data.get('parent_adr_id')
    if not parent_id:
        return jsonify({'error': 'parent_adr_id is required for follow-up reports.'}), 400
    try:
        res = submit_followup(parent_id, data, user)
        return jsonify(res), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/nurse/my-reports', methods=['GET'])
@require_role(['nurse'])
def nurse_my_reports():
    user = request.current_user
    status_filter = request.args.get('status')
    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT a.*, d.name as drug_name, mfg.name as manufacturer_name, b.batch_number,
               (SELECT COUNT(*) FROM adr_reports WHERE parent_adr_id = a.id) as followup_count
        FROM adr_reports a
        LEFT JOIN adr_medications m ON m.adr_id = a.id
        LEFT JOIN drugs d ON d.id = m.drug_id
        LEFT JOIN manufacturers mfg ON mfg.id = m.manufacturer_id
        LEFT JOIN batches b ON b.id = m.batch_id
        WHERE a.reporter_id = ?
    """
    params = [user['id']]
    if status_filter:
        query += " AND a.submission_status = ?"
        params.append(status_filter.upper())
    query += " ORDER BY a.created_at DESC"

    cur.execute(query, params)
    reports = [dict(r) for r in cur.fetchall()]
    conn.close()

    for r in reports:
        try:
            r['reaction_symptoms'] = json.loads(r['reaction_symptoms'])
        except Exception:
            pass

    return jsonify(reports)

@app.route('/api/nurse/sync-queue', methods=['POST'])
@require_role(['nurse'])
def nurse_sync_queue():
    """
    Sync engine endpoint: receives queued offline reports, creates them idempotently.
    """
    data = request.get_json() or {}
    items = data.get('items', [])
    user = request.current_user
    synced = []
    failed = []

    for item in items:
        try:
            temp_id = item.get('client_temp_id')
            if temp_id:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute("SELECT id, report_number FROM adr_reports WHERE client_temp_id = ?", (temp_id,))
                existing = cur.fetchone()
                conn.close()
                if existing:
                    synced.append({
                        'client_temp_id': temp_id,
                        'id': existing['id'],
                        'report_number': existing['report_number'],
                        'already_existed': True
                    })
                    continue

            if item.get('is_followup') and item.get('parent_adr_id'):
                res = submit_followup(item['parent_adr_id'], item, user)
            else:
                res = create_adr_report(item, user)

            synced.append({
                'client_temp_id': temp_id,
                'id': res['id'],
                'report_number': res['report_number'],
                'already_existed': False
            })
        except Exception as e:
            failed.append({'item': item, 'error': str(e)})

    return jsonify({
        'synced_count': len(synced),
        'failed_count': len(failed),
        'synced': synced,
        'failed': failed
    })

# ----------------- ADR Head Endpoints -----------------

@app.route('/api/adr-head/dashboard', methods=['GET'])
@require_role(['adr_head'])
def adr_head_dashboard():
    metrics = get_dashboard_metrics()
    return jsonify(metrics)

@app.route('/api/adr-head/inbox', methods=['GET'])
@require_role(['adr_head'])
def adr_head_inbox():
    search = request.args.get('search', '').strip().lower()
    severity = request.args.get('severity')
    status = request.args.get('status')
    ward = request.args.get('ward')
    drug_id = request.args.get('drug_id')
    batch_num = request.args.get('batch')
    mfg_id = request.args.get('manufacturer_id')
    reviewed = request.args.get('reviewed')
    high_alert = request.args.get('high_alert')

    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT a.id, a.report_number, a.patient_initials, a.patient_age, a.patient_sex,
               a.reaction_symptoms, a.reaction_severity, a.reaction_onset, a.reaction_outcome,
               a.submission_status, a.causality_assessment, a.ward, a.created_at,
               a.reviewed_by, a.parent_adr_id,
               u.name as reporter_name,
               d.id as drug_id, d.name as drug_name, d.is_high_alert as drug_high_alert,
               mfg.id as manufacturer_id, mfg.name as manufacturer_name,
               b.id as batch_id, b.batch_number, b.is_high_alert as batch_high_alert
        FROM adr_reports a
        JOIN users u ON u.id = a.reporter_id
        LEFT JOIN adr_medications m ON m.adr_id = a.id
        LEFT JOIN drugs d ON d.id = m.drug_id
        LEFT JOIN manufacturers mfg ON mfg.id = m.manufacturer_id
        LEFT JOIN batches b ON b.id = m.batch_id
        WHERE a.submission_status IN ('PARTIAL', 'COMPLETE')
    """
    params = []

    if search:
        query += """ AND (
            LOWER(a.report_number) LIKE ? OR
            LOWER(d.name) LIKE ? OR
            LOWER(b.batch_number) LIKE ? OR
            LOWER(u.name) LIKE ? OR
            LOWER(a.patient_initials) LIKE ? OR
            LOWER(a.reaction_symptoms) LIKE ?
        )"""
        p = f"%{search}%"
        params.extend([p, p, p, p, p, p])

    if severity:
        query += " AND a.reaction_severity = ?"
        params.append(severity.upper())
    if status:
        query += " AND a.submission_status = ?"
        params.append(status.upper())
    if ward:
        query += " AND a.ward = ?"
        params.append(ward)
    if drug_id:
        query += " AND d.id = ?"
        params.append(int(drug_id))
    if batch_num:
        query += " AND UPPER(b.batch_number) = ?"
        params.append(batch_num.upper())
    if mfg_id:
        query += " AND mfg.id = ?"
        params.append(int(mfg_id))
    case_filter = request.args.get('case_filter')
    if case_filter == 'open' or reviewed == 'no':
        query += " AND a.reviewed_by IS NULL"
    elif case_filter == 'closed' or reviewed == 'yes':
        query += " AND a.reviewed_by IS NOT NULL"
    elif case_filter == 'followup':
        query += " AND a.parent_adr_id IS NOT NULL"

    if high_alert == 'yes':
        query += " AND (b.is_high_alert = 1 OR d.is_high_alert = 1)"

    query += " ORDER BY a.created_at DESC"

    cur.execute(query, params)
    reports = [dict(r) for r in cur.fetchall()]
    conn.close()

    for r in reports:
        try:
            r['reaction_symptoms'] = json.loads(r['reaction_symptoms'])
        except Exception:
            pass

    return jsonify(reports)

@app.route('/api/adr/<int:adr_id>', methods=['GET'])
@app.route('/api/nurse/adr/<int:adr_id>', methods=['GET'])
@app.route('/api/adr-head/adr/<int:adr_id>', methods=['GET'])
@require_role(['nurse', 'adr_head', 'admin'])
def adr_head_adr_detail(adr_id):
    adr = get_adr_detail(adr_id)
    if not adr:
        return jsonify({'error': 'ADR report not found.'}), 404
    return jsonify(adr)

@app.route('/api/adr-head/adr/<int:adr_id>/review', methods=['POST'])
@require_role(['adr_head'])
def adr_head_review_submit(adr_id):
    data = request.get_json() or {}
    user = request.current_user
    causality = data.get('causality_assessment')
    action_taken = data.get('action_taken')
    outcome = data.get('clinical_review_outcome')
    notes = data.get('clinical_review_notes')

    try:
        update_clinical_review(adr_id, causality, action_taken, outcome, notes, user)
        return jsonify({'message': 'Clinical assessment recorded successfully.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/adr-head/drug-risk-profile/<int:drug_id>', methods=['GET'])
@require_role(['adr_head'])
def adr_head_drug_risk_profile(drug_id):
    profile = get_drug_risk_profile(drug_id)
    if not profile:
        return jsonify({'error': 'Drug not found.'}), 404
    return jsonify(profile)

@app.route('/api/adr-head/high-alert', methods=['POST'])
@require_role(['adr_head'])
def adr_head_toggle_high_alert():
    data = request.get_json() or {}
    user = request.current_user
    target_type = data.get('target_type')
    target_id = data.get('target_id')
    reason = data.get('reason')
    note = data.get('note')
    action = data.get('action', 'ACTIVATE')

    if not target_type or not target_id:
        return jsonify({'error': 'target_type and target_id are required.'}), 400

    try:
        if action == 'ACTIVATE':
            if not reason:
                return jsonify({'error': 'A clinical reason is mandatory for High Alert activation.'}), 400
            aid = set_high_alert(target_type, target_id, reason, note, user)
            return jsonify({'message': 'High Alert successfully activated.', 'alert_id': aid})
        else:
            remove_high_alert(target_type, target_id, user)
            return jsonify({'message': 'High Alert successfully removed.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/adr-head/safety-action', methods=['POST'])
@require_role(['adr_head'])
def adr_head_create_safety_action():
    data = request.get_json() or {}
    user = request.current_user
    try:
        res = create_safety_action(data, user)
        return jsonify({
            'message': 'Safety instruction transmitted to Administrator successfully.',
            'action_id': res['action_id'],
            'task_id': res['task_id'],
            'task_number': res['task_number']
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/adr-head/admin-tasks', methods=['GET'])
@require_role(['adr_head'])
def adr_head_admin_tasks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT t.*, d.name as drug_name, d.dosage_form,
               mfg.name as manufacturer_name, b.batch_number,
               u.name as completed_by_name
        FROM admin_tasks t
        JOIN drugs d ON d.id = t.drug_id
        LEFT JOIN manufacturers mfg ON mfg.id = t.manufacturer_id
        LEFT JOIN batches b ON b.id = t.batch_id
        LEFT JOIN users u ON u.id = t.completed_by
        ORDER BY t.created_at DESC
    """)
    tasks = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(tasks)

@app.route('/api/adr-head/pvpi-referrals', methods=['GET'])
@require_role(['adr_head'])
def adr_head_list_pvpi():
    referrals = list_pvpi_referrals()
    return jsonify(referrals)

@app.route('/api/adr-head/pvpi-referral', methods=['POST'])
@require_role(['adr_head'])
def adr_head_create_pvpi():
    data = request.get_json() or {}
    user = request.current_user
    try:
        res = create_pvpi_referral(data, user)
        return jsonify(res), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/adr-head/pvpi-referral/<int:ref_id>', methods=['GET'])
@require_role(['adr_head'])
def adr_head_pvpi_detail(ref_id):
    detail = get_pvpi_referral_detail(ref_id)
    if not detail:
        return jsonify({'error': 'Referral not found.'}), 404
    return jsonify(detail)

@app.route('/api/adr-head/pvpi-referral/<int:ref_id>/status', methods=['POST'])
@require_role(['adr_head'])
def adr_head_pvpi_status(ref_id):
    data = request.get_json() or {}
    user = request.current_user
    status = data.get('status')
    try:
        update_pvpi_status(ref_id, status, user)
        return jsonify({'message': f'PvPI Referral status updated to {status}.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/adr-head/audit-logs', methods=['GET'])
@require_role(['adr_head', 'admin'])
def adr_head_audit_logs():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM audit_logs
        ORDER BY created_at DESC LIMIT 50
    """)
    logs = [dict(r) for r in cur.fetchall()]
    conn.close()
    for l in logs:
        try:
            l['details_json'] = json.loads(l['details_json'])
        except Exception:
            pass
    return jsonify(logs)

# ----------------- Administrator Endpoints -----------------

@app.route('/api/admin/home', methods=['GET'])
@require_role(['admin'])
def admin_home():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) as cnt FROM admin_tasks WHERE status = 'PENDING'")
    pending_count = cur.fetchone()['cnt']

    cur.execute("SELECT COUNT(*) as cnt FROM admin_tasks WHERE status = 'IN_PROGRESS'")
    in_progress_count = cur.fetchone()['cnt']

    cur.execute("SELECT COUNT(*) as cnt FROM admin_tasks WHERE status = 'COMPLETED'")
    completed_count = cur.fetchone()['cnt']

    cur.execute("SELECT COUNT(*) as cnt FROM high_alerts WHERE is_active = 1")
    high_alert_count = cur.fetchone()['cnt']

    # Urgent High Alert items banner
    cur.execute("""
        SELECT t.id, t.task_number, t.action_type, t.priority, t.reason, t.instructions,
               d.name as drug_name, b.batch_number, mfg.name as manufacturer_name
        FROM admin_tasks t
        JOIN drugs d ON d.id = t.drug_id
        LEFT JOIN batches b ON b.id = t.batch_id
        LEFT JOIN manufacturers mfg ON mfg.id = t.manufacturer_id
        WHERE t.status IN ('PENDING', 'IN_PROGRESS') AND (t.action_type = 'STOP_USAGE' OR t.priority = 'HIGH')
        ORDER BY t.created_at DESC LIMIT 5
    """)
    urgent_tasks = [dict(r) for r in cur.fetchall()]

    # Recent safety instructions
    cur.execute("""
        SELECT t.*, d.name as drug_name, b.batch_number
        FROM admin_tasks t
        JOIN drugs d ON d.id = t.drug_id
        LEFT JOIN batches b ON b.id = t.batch_id
        ORDER BY t.created_at DESC LIMIT 6
    """)
    recent_tasks = [dict(r) for r in cur.fetchall()]

    conn.close()
    return jsonify({
        'pending_count': pending_count,
        'in_progress_count': in_progress_count,
        'completed_count': completed_count,
        'high_alert_count': high_alert_count,
        'urgent_tasks': urgent_tasks,
        'recent_tasks': recent_tasks
    })

@app.route('/api/admin/tasks', methods=['GET'])
@require_role(['admin'])
def admin_tasks():
    status = request.args.get('status')
    priority = request.args.get('priority')
    search = request.args.get('search', '').strip().lower()

    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT t.*, d.name as drug_name, d.dosage_form,
               mfg.name as manufacturer_name, b.batch_number,
               sa.created_by as adr_head_id, u.name as adr_head_name
        FROM admin_tasks t
        JOIN drugs d ON d.id = t.drug_id
        LEFT JOIN manufacturers mfg ON mfg.id = t.manufacturer_id
        LEFT JOIN batches b ON b.id = t.batch_id
        JOIN safety_actions sa ON sa.id = t.safety_action_id
        JOIN users u ON u.id = sa.created_by
        WHERE 1=1
    """
    params = []
    if status:
        query += " AND t.status = ?"
        params.append(status.upper())
    if priority:
        query += " AND t.priority = ?"
        params.append(priority.upper())
    if search:
        query += " AND (LOWER(t.task_number) LIKE ? OR LOWER(d.name) LIKE ? OR LOWER(b.batch_number) LIKE ?)"
        p = f"%{search}%"
        params.extend([p, p, p])

    query += " ORDER BY CASE t.status WHEN 'PENDING' THEN 1 WHEN 'IN_PROGRESS' THEN 2 ELSE 3 END, t.created_at DESC"

    cur.execute(query, params)
    tasks = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(tasks)

@app.route('/api/admin/tasks/<int:task_id>', methods=['GET'])
@require_role(['admin'])
def admin_task_detail(task_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT t.*, d.name as drug_name, d.dosage_form, d.strength,
               mfg.name as manufacturer_name, b.batch_number, b.expiry_date,
               sa.related_adr_ids, sa.created_by as adr_head_id,
               head.name as adr_head_name, head.email as adr_head_email,
               completed.name as completed_by_name
        FROM admin_tasks t
        JOIN drugs d ON d.id = t.drug_id
        LEFT JOIN manufacturers mfg ON mfg.id = t.manufacturer_id
        LEFT JOIN batches b ON b.id = t.batch_id
        JOIN safety_actions sa ON sa.id = t.safety_action_id
        JOIN users head ON head.id = sa.created_by
        LEFT JOIN users completed ON completed.id = t.completed_by
        WHERE t.id = ?
    """, (task_id,))
    task = cur.fetchone()
    if not task:
        conn.close()
        return jsonify({'error': 'Task not found.'}), 404

    task_data = dict(task)
    related_ids = []
    try:
        related_ids = json.loads(task_data.get('related_adr_ids') or '[]')
    except Exception:
        pass

    attached_adrs = []
    if related_ids:
        placeholders = ','.join('?' for _ in related_ids)
        cur.execute(f"""
            SELECT a.id, a.report_number, a.patient_initials, a.reaction_severity,
                   a.reaction_symptoms, u.name as reporter_name, a.created_at
            FROM adr_reports a
            JOIN users u ON u.id = a.reporter_id
            WHERE a.id IN ({placeholders})
        """, related_ids)
        attached_adrs = [dict(r) for r in cur.fetchall()]

    task_data['attached_adrs'] = attached_adrs
    conn.close()
    return jsonify(task_data)

@app.route('/api/admin/tasks/<int:task_id>/status', methods=['POST'])
@require_role(['admin'])
def admin_task_update(task_id):
    data = request.get_json() or {}
    user = request.current_user
    new_status = data.get('status')
    remarks = data.get('completion_remarks')

    if not new_status:
        return jsonify({'error': 'Status is required.'}), 400

    try:
        update_admin_task_status(task_id, new_status, remarks, user)
        return jsonify({'message': f'Task status updated to {new_status}.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/dispensing-lookup', methods=['GET'])
@require_role(['admin'])
def admin_dispensing_lookup():
    """
    Search by Drug + Batch to immediately obtain safety status before handing to nurse.
    Does NOT write a permanent dispensing transaction log (per Section 28).
    """
    drug_id = request.args.get('drug_id')
    batch_id = request.args.get('batch_id')
    batch_number = request.args.get('batch_number')

    if not drug_id:
        return jsonify({'error': 'Drug selection is required.'}), 400

    result = check_dispensing_safety(drug_id, batch_id, batch_number)
    return jsonify(result)

# ----------------- Master Data Management (Admin) -----------------

@app.route('/api/admin/drugs', methods=['POST'])
@require_role(['admin'])
def admin_save_drug():
    data = request.get_json() or {}
    user = request.current_user
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Drug name is required.'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO drugs (name, generic_name, dosage_form, strength, therapeutic_class)
        VALUES (?, ?, ?, ?, ?)
    """, (name, data.get('generic_name'), data.get('dosage_form'), data.get('strength'), data.get('therapeutic_class')))
    drug_id = cur.lastrowid
    log_audit(conn, user['id'], user['name'], user['role'], 'DRUG_CREATED', 'drugs', drug_id, {'name': name})
    conn.commit()
    conn.close()
    return jsonify({'message': 'Drug created successfully.', 'id': drug_id}), 201

@app.route('/api/admin/manufacturers', methods=['POST'])
@require_role(['admin'])
def admin_save_manufacturer():
    data = request.get_json() or {}
    user = request.current_user
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Manufacturer name is required.'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO manufacturers (name, code, country)
        VALUES (?, ?, ?)
    """, (name, data.get('code'), data.get('country', 'India')))
    mfg_id = cur.lastrowid
    log_audit(conn, user['id'], user['name'], user['role'], 'MANUFACTURER_CREATED', 'manufacturers', mfg_id, {'name': name})
    conn.commit()
    conn.close()
    return jsonify({'message': 'Manufacturer created successfully.', 'id': mfg_id}), 201

@app.route('/api/admin/batches', methods=['POST'])
@require_role(['admin'])
def admin_save_batch():
    data = request.get_json() or {}
    user = request.current_user
    drug_id = data.get('drug_id')
    manufacturer_id = data.get('manufacturer_id')
    batch_number = (data.get('batch_number') or '').strip().upper()

    if not drug_id or not manufacturer_id or not batch_number:
        return jsonify({'error': 'Drug, Manufacturer, and Batch number are required.'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO batches (drug_id, manufacturer_id, batch_number, mfg_date, expiry_date)
            VALUES (?, ?, ?, ?, ?)
        """, (int(drug_id), int(manufacturer_id), batch_number, data.get('mfg_date'), data.get('expiry_date')))
        batch_id = cur.lastrowid
        log_audit(conn, user['id'], user['name'], user['role'], 'BATCH_CREATED', 'batches', batch_id, {'batch_number': batch_number})
        conn.commit()
        conn.close()
        return jsonify({'message': 'Batch created successfully.', 'id': batch_id}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': f"Batch '{batch_number}' already exists for this drug and manufacturer."}), 400

# ----------------- Safety Notices & Alert Distribution System -----------------

@app.route('/api/safety-notices', methods=['GET'])
@login_required
def list_safety_notices():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT sn.*, d.name as drug_name, b.batch_number, u.name as created_by_name
        FROM safety_notices sn
        LEFT JOIN drugs d ON d.id = sn.drug_id
        LEFT JOIN batches b ON b.id = sn.batch_id
        LEFT JOIN users u ON u.id = sn.created_by
        WHERE sn.is_active = 1
        ORDER BY CASE sn.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH_ALERT' THEN 2 WHEN 'WARNING' THEN 3 ELSE 4 END, sn.created_at DESC
    """)
    notices = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(notices)

@app.route('/api/admin/safety-notices', methods=['POST'])
@require_role(['admin', 'adr_head'])
def create_safety_notice():
    data = request.get_json() or {}
    user = request.current_user
    title = (data.get('title') or '').strip()
    severity = data.get('severity', 'HIGH_ALERT').upper()
    drug_id = data.get('drug_id')
    batch_id = data.get('batch_id')
    target_wards = data.get('target_wards') or 'All Clinical Wards'
    content = (data.get('content') or '').strip()
    action_instructions = data.get('action_instructions') or ''

    if not title or not content:
        return jsonify({'error': 'Title and notice content are required.'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    
    # Generate notice number
    year = datetime.now().year
    cur.execute("SELECT COUNT(*) as cnt FROM safety_notices")
    cnt = cur.fetchone()['cnt'] + 1
    notice_number = f"SN-{year}-{cnt:03d}"

    cur.execute("""
        INSERT INTO safety_notices (notice_number, title, severity, drug_id, batch_id, target_wards, content, action_instructions, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (notice_number, title, severity, drug_id if drug_id else None, batch_id if batch_id else None, target_wards, content, action_instructions, user['id']))
    notice_id = cur.lastrowid

    # Alert Distribution System: broadcast alerts to nurses and adr_heads
    notif_title = f"🚨 [{severity}] {title}"
    notif_msg = f"{content[:120]}... Instructions: {action_instructions[:100]}"
    create_notification(conn, 'nurse', notif_title, notif_msg, link='#/nurse-home')
    create_notification(conn, 'adr_head', notif_title, notif_msg, link='#/dashboard')
    create_notification(conn, 'admin', notif_title, notif_msg, link='#/admin-home')

    log_audit(conn, user['id'], user['name'], user['role'], 'SAFETY_NOTICE_CREATED', 'safety_notices', notice_id, {
        'notice_number': notice_number, 'severity': severity, 'title': title
    })
    conn.commit()
    conn.close()

    return jsonify({'message': f'Safety notice {notice_number} broadcasted to all clinical wards.', 'id': notice_id, 'notice_number': notice_number}), 201

# ----------------- Notifications -----------------

@app.route('/api/notifications', methods=['GET'])
@login_required
def get_notifications():
    user = request.current_user
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM notifications
        WHERE (user_id = ? OR role = ?)
        ORDER BY created_at DESC LIMIT 15
    """, (user['id'], user['role']))
    notifs = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(notifs)

@app.route('/api/notifications/<int:notif_id>/read', methods=['POST'])
@login_required
def mark_notification_read(notif_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notif_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Marked as read.'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
