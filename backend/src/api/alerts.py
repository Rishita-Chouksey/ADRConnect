from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import AsyncSessionLocal
from src.schemas.alerts import HighAlertCreate
from src.core.schemas.user import CurrentUser
from src.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/alerts", tags=["High Alerts & Notifications"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# 1. Flag High Alert (ADR Head only)
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(["adr_head"]))]
)
async def create_high_alert(
    alert_data: HighAlertCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Allows ADR Head to flag a medication batch and issue a high alert."""
    
    # Check if batch exists for this hospital
    batch_check = text("""
        SELECT id FROM batches 
        WHERE id = :batch_id AND hospital_id = :hospital_id;
    """)
    batch_res = await db.execute(batch_check, {
        "batch_id": alert_data.batch_id,
        "hospital_id": current_user.hospital_id
    })
    if not batch_res.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Batch not found in hospital inventory"
        )

    # Insert High Alert using exact schema columns
    insert_query = text("""
        INSERT INTO high_alerts (
            hospital_id, batch_id, flagged_by, reason, severity_level, active
        ) VALUES (
            :hospital_id, :batch_id, :flagged_by, :reason, :severity_level, true
        )
        RETURNING id, flagged_at;
    """)

    params = {
        "hospital_id": current_user.hospital_id,
        "batch_id": alert_data.batch_id,
        "flagged_by": current_user.id,
        "reason": alert_data.reason,
        "severity_level": alert_data.severity_level
    }

    try:
        result = await db.execute(insert_query, params)
        alert_row = result.mappings().first()
        await db.commit()

        return {
            "message": "High alert successfully issued for batch",
            "alert_id": alert_row["id"],
            "flagged_at": alert_row["flagged_at"]
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# 2. View High Alerts (Administrator only)
@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_roles(["administrator"]))]
)
async def list_high_alerts(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Allows Administrator to review all high alerts issued by the ADR Head."""
    query = text("""
        SELECT 
            ha.id,
            ha.hospital_id,
            ha.batch_id,
            b.batch_no,
            ha.flagged_by,
            u.name AS flagged_by_name,
            ha.reason,
            ha.severity_level,
            ha.active,
            ha.flagged_at
        FROM high_alerts ha
        JOIN batches b ON ha.batch_id = b.id
        JOIN users u ON ha.flagged_by = u.id
        WHERE ha.hospital_id = :hospital_id
        ORDER BY ha.flagged_at DESC;
    """)

    result = await db.execute(query, {"hospital_id": current_user.hospital_id})
    return result.mappings().all()
