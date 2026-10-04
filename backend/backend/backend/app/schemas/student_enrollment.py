from datetime import date

from pydantic import BaseModel, ConfigDict


class StudentEnrollmentCreate(BaseModel):
    student_id: int
    academic_year_id: int
    class_id: int
    section_id: int
    roll_no: int | None = None
    enrollment_date: date
    status: str = "ACTIVE"


class StudentEnrollmentUpdate(BaseModel):
    student_id: int
    academic_year_id: int
    class_id: int
    section_id: int
    roll_no: int | None = None
    enrollment_date: date
    status: str


class StudentEnrollmentResponse(BaseModel):
    id: int
    student_id: int
    academic_year_id: int
    class_id: int
    section_id: int
    roll_no: int | None
    enrollment_date: date
    status: str

    # Student portal display fields
    academic_year_name: str | None = None
    class_name: str | None = None
    section_name: str | None = None

    model_config = ConfigDict(from_attributes=True)