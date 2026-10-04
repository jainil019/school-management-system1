from datetime import date

from pydantic import BaseModel, ConfigDict


class FeeStructureCreate(BaseModel):
    academic_year_id: int
    class_id: int
    fee_type: str
    amount: float
    due_date: date


class FeeStructureUpdate(BaseModel):
    fee_type: str
    amount: float
    due_date: date


class FeeStructureResponse(BaseModel):
    id: int
    academic_year_id: int
    class_id: int
    fee_type: str
    amount: float
    due_date: date

    model_config = ConfigDict(from_attributes=True)