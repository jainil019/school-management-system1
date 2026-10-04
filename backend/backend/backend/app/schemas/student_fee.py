from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudentFeeCreate(BaseModel):
    student_id: int
    fee_structure_id: int


class StudentFeeUpdate(BaseModel):
    status: str


class StudentFeeResponse(BaseModel):
    id: int
    student_id: int
    fee_structure_id: int
    amount_due: float
    amount_paid: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)