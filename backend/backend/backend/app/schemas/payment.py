from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PaymentCreate(BaseModel):
    student_fee_id: int
    amount: float
    method: str
    receipt_no: str


class PaymentResponse(BaseModel):
    id: int
    student_fee_id: int
    amount: float
    paid_at: datetime
    method: str
    receipt_no: str
    recorded_by: int

    model_config = ConfigDict(from_attributes=True)