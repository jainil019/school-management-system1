from datetime import date

from pydantic import BaseModel, ConfigDict


class ExaminationCreate(BaseModel):
    name: str
    academic_year_id: int
    start_date: date
    end_date: date
    status: str


class ExaminationUpdate(BaseModel):
    name: str
    academic_year_id: int
    start_date: date
    end_date: date
    status: str


class ExaminationResponse(BaseModel):
    id: int
    name: str
    academic_year_id: int
    start_date: date
    end_date: date
    status: str

    model_config = ConfigDict(from_attributes=True)