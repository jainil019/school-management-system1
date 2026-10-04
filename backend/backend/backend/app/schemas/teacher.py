from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class TeacherCreate(BaseModel):
    user_id: int
    employee_id: str
    first_name: str
    last_name: str
    phone: str | None = None
    address: str | None = None
    dob: date | None = None
    gender: str | None = None
    qualification: str | None = None
    joining_date: date | None = None
    photo_url: str | None = None
    status: str = "ACTIVE"


class TeacherUpdate(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    phone: str | None = None
    address: str | None = None
    dob: date | None = None
    gender: str | None = None
    qualification: str | None = None
    joining_date: date | None = None
    photo_url: str | None = None
    status: str = "ACTIVE"


class TeacherAccountCreate(BaseModel):
    email: str
    password: str
    employee_id: str
    first_name: str
    last_name: str
    phone: str | None = None
    address: str | None = None
    dob: date | None = None
    gender: str | None = None
    qualification: str | None = None
    joining_date: date | None = None
    photo_url: str | None = None
    status: str = "ACTIVE"


class TeacherResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    first_name: str
    last_name: str
    phone: str | None
    address: str | None
    dob: date | None
    gender: str | None
    qualification: str | None
    joining_date: date | None
    photo_url: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)