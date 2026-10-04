from datetime import date

from pydantic import BaseModel, ConfigDict


class ParentStudentLinkCreate(BaseModel):
    parent_id: int
    student_id: int
    relationship: str


class ParentStudentLinkResponse(BaseModel):
    id: int
    parent_id: int
    student_id: int
    relationship: str

    model_config = ConfigDict(from_attributes=True)


class ParentChildResponse(BaseModel):
    link_id: int
    student_id: int
    relationship: str

    admission_no: str
    first_name: str
    last_name: str
    dob: date | None
    gender: str | None
    phone: str | None
    address: str | None
    admission_date: date | None
    photo_url: str | None
    status: str