from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class TokenData(BaseModel):
    user_id: UUID
    role: str
    hospital_id: UUID

class CurrentUser(BaseModel):
    id: UUID
    hospital_id: UUID
    name: str
    role: str
    employee_id: str
    ward: Optional[str] = None
    occupation: Optional[str] = None