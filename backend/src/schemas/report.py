from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

# --- Section A: Patient Info ---
class PatientInfo(BaseModel):
    patient_initials: str = Field(..., max_length=10)
    patient_age: str = Field(..., description="Age or Date of Birth string (e.g. '42 years')")
    patient_sex: str = Field(..., pattern="^(Male|Female|Other)$")
    patient_weight_kg: Optional[float] = Field(None, ge=0.0)
    reg_ipd_opd_no: Optional[str] = None
    amc_report_no: Optional[str] = None
    worldwide_unique_no: Optional[str] = None

# --- Section B: Reaction Info ---
class ReactionInfo(BaseModel):
    reaction_start_date: date
    reaction_stop_date: Optional[date] = None
    onset_lag_time: Optional[str] = None
    reaction_description: str
    lab_data_tests: Optional[str] = None
    other_history: Optional[str] = None
    symptoms: List[str] = Field(default=[], description="Selected symptoms (e.g. ['Shivering', 'Vomiting'])")

# --- Section C: Suspected Medication (Foreign key link to Batch) ---
class SuspectedMedicationCreate(BaseModel):
    batch_id: UUID
    row_order: int = 1
    dose_used: Optional[str] = None
    route_used: Optional[str] = None
    frequency: Optional[str] = None
    therapy_start_date: Optional[date] = None
    therapy_stop_date: Optional[date] = None
    indication: Optional[str] = None
    action_taken: Optional[str] = None
    reintroduction_reaction: Optional[str] = None
    reintroduction_dose: Optional[str] = None
    causality_assessment: Optional[str] = None

# --- Section D: Seriousness & Outcomes ---
class SeriousnessAndOutcome(BaseModel):
    seriousness_flags: Optional[List[str]] = Field(default=[])
    outcome: Optional[str] = None

# --- Main API Request Schema ---
class ADRReportCreate(BaseModel):
    local_uuid: UUID
    ward: str
    case_type: str = "initial"
    submission_state: str = "complete"
    patient_info: PatientInfo
    reaction_info: ReactionInfo
    suspected_medications: List[SuspectedMedicationCreate]
    concomitant_drugs: Optional[List[dict]] = []
    seriousness_and_outcome: SeriousnessAndOutcome
    additional_info: Optional[str] = None