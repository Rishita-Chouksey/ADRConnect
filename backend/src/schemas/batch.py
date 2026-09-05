from pydantic import BaseModel
from typing import Optional
from datetime import date
from uuid import UUID

class BatchSearchResult(BaseModel):
    id: UUID
    batch_no: str
    product_name: Optional[str] = None
    manufacturer_name: Optional[str] = None
    mfg_date: Optional[date] = None
    exp_date: Optional[date] = None
    barcode_data: Optional[str] = None

    class Config:
        from_attributes = True