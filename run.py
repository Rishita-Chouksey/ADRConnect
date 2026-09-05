import os
import sys
from database import init_db, get_db_connection
from seed_data import seed_database
from app import app

def main():
    print("==================================================")
    print("  ADRConnect — Production Server Starting")
    print("  Batch-Level Traceability & Alert System")
    print("==================================================")

    init_db()

    # Check if database has users; if not, automatically seed
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as cnt FROM users")
    user_count = cur.fetchone()['cnt']
    conn.close()

    if user_count == 0:
        print("Empty database detected. Running realistic pharmacovigilance seed data...")
        seed_database()
    else:
        print(f"Database verified. {user_count} accounts registered.")

    print("\nServer listening on: http://localhost:5000")
    print("Demo Users:")
    print("  • Nurse:         nurse1@adrconnect.demo (pw: demo123)")
    print("  • ADR Head:      adrhead@adrconnect.demo (pw: demo123)")
    print("  • Administrator: admin@adrconnect.demo (pw: demo123)")
    print("  • Instant Role Switcher enabled in top header!\n")

    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    main()
