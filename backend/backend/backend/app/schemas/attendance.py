from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AttendanceCreate(BaseModel):
    student_id: int
    enrollment_id: int
    date: date
    status: str
    marked_by: int | None = None


class AttendanceUpdate(BaseModel):
    status: str


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    enrollment_id: int
    date: date
    status: str
    marked_by: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)