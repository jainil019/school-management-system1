from datetime import date

from pydantic import BaseModel, ConfigDict


class AcademicYearCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_current: bool = False


class AcademicYearUpdate(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_current: bool = False


class AcademicYearResponse(BaseModel):
    id: int
    name: str
    start_date: date
    end_date: date
    is_current: bool

    model_config = ConfigDict(from_attributes=True)