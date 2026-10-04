from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ParentCreate(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    phone: str | None = None
    address: str | None = None


class ParentAccountCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    phone: str | None = None
    address: str | None = None


class ParentUpdate(BaseModel):
    first_name: str
    last_name: str
    phone: str | None = None
    address: str | None = None


class ParentResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParentProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: str | None
    address: str | None
    email: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)