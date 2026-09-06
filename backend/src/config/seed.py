import asyncio
import os
from datetime import date
from passlib.context import CryptContext
from sqlalchemy import text
from src.config.database import AsyncSessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed_data():
    seed_password = os.getenv("SEED_USER_PASSWORD")
    if not seed_password:
        raise RuntimeError("Set SEED_USER_PASSWORD before running the seed script")

    async with AsyncSessionLocal() as session:
        async with session.begin():
            print("🌱 Seeding initial data...")

            # 1. Seed Hospital
            hospital_query = text("""
                INSERT INTO hospitals (name, state)
                VALUES ('AIIMS New Delhi', 'Delhi')
                ON CONFLICT DO NOTHING
                RETURNING id;
            """)
            res = await session.execute(hospital_query)
            hospital_id = res.scalar()

            if not hospital_id:
                h_res = await session.execute(text("SELECT id FROM hospitals WHERE name = 'AIIMS New Delhi'"))
                hospital_id = h_res.scalar()

            # 2. Seed Test Users (1 Nurse, 1 ADR Head, 1 Admin)
            hashed_pwd = hash_password(seed_password)

            users_data = [
                {
                    "hospital_id": hospital_id,
                    "name": "Priya Sharma",
                    "role": "nurse",
                    "employee_id": "NURSE-01",
                    "password_hash": hashed_pwd,
                    "ward": "Maternal Ward 3",
                    "occupation": "Staff Nurse"
                },
                {
                    "hospital_id": hospital_id,
                    "name": "Dr. Rajesh Kumar",
                    "role": "adr_head",
                    "employee_id": "HEAD-01",
                    "password_hash": hashed_pwd,
                    "ward": "Pharmacovigilance Unit",
                    "occupation": "Pharmacovigilance Specialist"
                },
                {
                    "hospital_id": hospital_id,
                    "name": "Anil Verma",
                    "role": "administrator",
                    "employee_id": "ADMIN-01",
                    "password_hash": hashed_pwd,
                    "ward": "Pharmacy Store",
                    "occupation": "Chief Pharmacist"
                }
            ]

            user_insert = text("""
                INSERT INTO users (hospital_id, name, role, employee_id, password_hash, ward, occupation)
                VALUES (:hospital_id, :name, CAST(:role AS user_role), :employee_id, :password_hash, :ward, :occupation)
                ON CONFLICT (employee_id) DO NOTHING;
            """)
            for u in users_data:
                await session.execute(user_insert, u)

            # 3. Seed Global Drug Products
            drugs_data = [
                {"name": "Dextrose 5D", "generic_name": "Dextrose 5% w/v", "form": "500ml IV infusion"},
                {"name": "Normal Saline", "generic_name": "Sodium Chloride 0.9% w/v", "form": "500ml IV infusion"},
                {"name": "Avil", "generic_name": "Pheniramine Maleate", "form": "2ml injection"}
            ]
            drug_insert = text("""
                INSERT INTO drug_products (name, generic_name, form)
                VALUES (:name, :generic_name, :form)
                ON CONFLICT DO NOTHING;
            """)
            for d in drugs_data:
                await session.execute(drug_insert, d)

            # Fetch Drug IDs
            d1_res = await session.execute(text("SELECT id FROM drug_products WHERE name = 'Dextrose 5D'"))
            d1_id = d1_res.scalar()

            # 4. Seed Global Manufacturers
            mfg_data = [
                {"name": "Vision Parenteral Ltd", "address": "Plot 42, Industrial Zone, Gujarat", "license_no": "MFG/PH/2023/8892"},
                {"name": "Cipla Pharmaceuticals", "address": "Mumbai, Maharashtra", "license_no": "MFG/PH/2021/1042"}
            ]
            mfg_insert = text("""
                INSERT INTO manufacturers (name, address, license_no)
                VALUES (:name, :address, :license_no)
                ON CONFLICT DO NOTHING;
            """)
            for m in mfg_data:
                await session.execute(mfg_insert, m)

            # Fetch Manufacturer IDs
            m1_res = await session.execute(text("SELECT id FROM manufacturers WHERE name = 'Vision Parenteral Ltd'"))
            m1_id = m1_res.scalar()

            # 5. Seed Hospital-Scoped Batch
            batch_data = {
                "hospital_id": hospital_id,
                "product_id": d1_id,
                "manufacturer_id": m1_id,
                "batch_no": "MP251001073",
                "mfg_date": date(2025, 10, 1),
                "exp_date": date(2028, 9, 30)
            }
            batch_insert = text("""
                INSERT INTO batches (hospital_id, product_id, manufacturer_id, batch_no, mfg_date, exp_date)
                VALUES (:hospital_id, :product_id, :manufacturer_id, :batch_no, CAST(:mfg_date AS DATE), CAST(:exp_date AS DATE))
                ON CONFLICT (hospital_id, product_id, manufacturer_id, batch_no) DO NOTHING;
            """)
            await session.execute(batch_insert, batch_data)

            print("✅ Seeding completed successfully!")
            print("--------------------------------------------------")
            print("Test User Accounts (password supplied through SEED_USER_PASSWORD):")
            print("1. Nurse:         NURSE-01")
            print("2. ADR Head:      HEAD-01")
            print("3. Administrator: ADMIN-01")
            print("--------------------------------------------------")

if __name__ == "__main__":
    asyncio.run(seed_data())
