from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class StudentCreate(BaseModel):
    user_id: int
    admission_no: str
    first_name: str
    last_name: str
    dob: date | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    admission_date: date | None = None
    photo_url: str | None = None
    status: str = "ACTIVE"


class StudentUpdate(BaseModel):
    admission_no: str
    first_name: str
    last_name: str
    dob: date | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    admission_date: date | None = None
    photo_url: str | None = None
    status: str = "ACTIVE"


class StudentAccountCreate(BaseModel):
    email: str
    password: str
    admission_no: str
    first_name: str
    last_name: str
    dob: date | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    admission_date: date | None = None
    photo_url: str | None = None
    status: str = "ACTIVE"


class StudentResponse(BaseModel):
    id: int
    user_id: int
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
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )