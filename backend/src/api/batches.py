from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.config.database import AsyncSessionLocal
from src.schemas.batch import BatchSearchResult
from src.core.schemas.user import CurrentUser
from src.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/batches", tags=["Batches"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Batch Search for Mobile Auto-Complete / Barcode Scanner (Nurses & ADR Heads)
@router.get(
    "/search",
    response_model=List[BatchSearchResult],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_roles(["nurse", "adr_head"]))]
)
async def search_batches(
    q: str = Query(..., min_length=1, description="Batch number substring or exact barcode data"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Searches hospital batches by batch_no or barcode_data for rapid entry/scanning in mobile app."""
    search_query = text("""
        SELECT 
            b.id,
            b.batch_no,
            dp.name AS product_name,
            m.name AS manufacturer_name,
            b.mfg_date,
            b.exp_date,
            b.barcode_data
        FROM batches b
        LEFT JOIN drug_products dp ON b.product_id = dp.id
        LEFT JOIN manufacturers m ON b.manufacturer_id = m.id
        WHERE b.hospital_id = :hospital_id
          AND b.is_active = TRUE
          AND (
              b.batch_no ILIKE :search_pattern 
              OR b.barcode_data = :exact_query
          )
        ORDER BY b.batch_no ASC
        LIMIT 10;
    """)

    params = {
        "hospital_id": current_user.hospital_id,
        "search_pattern": f"%{q}%",
        "exact_query": q
    }

    try:
        result = await db.execute(search_query, params)
        return result.mappings().all()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
