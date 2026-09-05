from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class HighAlertCreate(BaseModel):
    batch_id: UUID
    reason: str
    severity_level: Optional[str] = "HIGH"  # CRITICAL, HIGH, MEDIUM

class HighAlertResponse(BaseModel):
    id: UUID
    hospital_id: UUID
    batch_id: UUID
    batch_no: str
    flagged_by: UUID
    reason: str
    severity_level: str
    created_at: datetime