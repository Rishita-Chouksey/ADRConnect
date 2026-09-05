import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import AsyncSessionLocal
from src.schemas.report import ADRReportCreate
from src.core.schemas.user import CurrentUser
from src.api.deps import get_current_user

router = APIRouter(prefix="/reports", tags=["ADR Reports"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_adr_report(
    report: ADRReportCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submits an ADR Report and inserts linked suspected medications in a relational transaction."""
    
    report_query = text("""
        INSERT INTO adr_reports (
            local_uuid, hospital_id, reporter_user_id, case_type, submission_state,
            patient_initials, patient_age, patient_sex, patient_weight_kg, reg_ipd_opd_no,
            amc_report_no, worldwide_unique_no, reaction_start_date, reaction_stop_date,
            onset_lag_time, reaction_description, lab_data_tests, other_history,
            seriousness_flags, outcome, concomitant_drugs, additional_info, ward
        ) VALUES (
            :local_uuid, :hospital_id, :reporter_user_id, CAST(:case_type AS case_type_enum), CAST(:submission_state AS submission_state_enum),
            :patient_initials, :patient_age, :patient_sex, :patient_weight_kg, :reg_ipd_opd_no,
            :amc_report_no, :worldwide_unique_no, :reaction_start_date, :reaction_stop_date,
            :onset_lag_time, :reaction_description, :lab_data_tests, :other_history,
            :seriousness_flags, :outcome, :concomitant_drugs, :additional_info, :ward
        )
        RETURNING id, created_at;
    """)
    
    report_params = {
        "local_uuid": report.local_uuid,
        "hospital_id": current_user.hospital_id,
        "reporter_user_id": current_user.id,
        "case_type": report.case_type,
        "submission_state": report.submission_state,
        "patient_initials": report.patient_info.patient_initials,
        "patient_age": report.patient_info.patient_age,
        "patient_sex": report.patient_info.patient_sex,
        "patient_weight_kg": report.patient_info.patient_weight_kg,
        "reg_ipd_opd_no": report.patient_info.reg_ipd_opd_no,
        "amc_report_no": report.patient_info.amc_report_no,
        "worldwide_unique_no": report.patient_info.worldwide_unique_no,
        "reaction_start_date": report.reaction_info.reaction_start_date,
        "reaction_stop_date": report.reaction_info.reaction_stop_date,
        "onset_lag_time": report.reaction_info.onset_lag_time,
        "reaction_description": report.reaction_info.reaction_description,
        "lab_data_tests": report.reaction_info.lab_data_tests,
        "other_history": report.reaction_info.other_history,
        "seriousness_flags": json.dumps(report.seriousness_and_outcome.seriousness_flags),
        "outcome": report.seriousness_and_outcome.outcome,
        "concomitant_drugs": json.dumps(report.concomitant_drugs),
        "additional_info": report.additional_info,
        "ward": report.ward
    }

    try:
        result = await db.execute(report_query, report_params)
        report_row = result.mappings().first()
        adr_report_id = report_row["id"]

        med_query = text("""
            INSERT INTO adr_medications (
                adr_report_id, batch_id, row_order, dose_used, route_used, frequency,
                therapy_start_date, therapy_stop_date, indication, action_taken,
                reintroduction_reaction, reintroduction_dose, causality_assessment
            ) VALUES (
                :adr_report_id, :batch_id, :row_order, :dose_used, :route_used, :frequency,
                :therapy_start_date, :therapy_stop_date, :indication, :action_taken,
                :reintroduction_reaction, :reintroduction_dose, :causality_assessment
            );
        """)

        for med in report.suspected_medications:
            med_params = med.model_dump()
            med_params["adr_report_id"] = adr_report_id
            await db.execute(med_query, med_params)

        await db.commit()
        return {"message": "ADR Report and medications submitted successfully", "report_id": adr_report_id}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", status_code=status.HTTP_200_OK)
async def list_adr_reports(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves all submitted ADR reports for the logged-in user's hospital."""
    query = text("""
        SELECT 
            r.*,
            COALESCE(
                json_agg(m.*) FILTER (WHERE m.id IS NOT NULL), '[]'
            ) AS medications
        FROM adr_reports r
        LEFT JOIN adr_medications m ON r.id = m.adr_report_id
        WHERE r.hospital_id = :hospital_id
        GROUP BY r.id
        ORDER BY r.created_at DESC;
    """)
    
    result = await db.execute(query, {"hospital_id": current_user.hospital_id})
    return result.mappings().all()