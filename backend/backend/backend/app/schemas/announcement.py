from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AnnouncementCreate(BaseModel):
    title: str
    description: str
    audience: str
    class_id: int | None = None
    section_id: int | None = None
    expires_at: datetime | None = None


class AnnouncementUpdate(BaseModel):
    title: str
    description: str
    audience: str
    class_id: int | None = None
    section_id: int | None = None
    expires_at: datetime | None = None


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    description: str
    audience: str
    class_id: int | None
    section_id: int | None
    created_by: int
    created_at: datetime
    expires_at: datetime | None

    model_config = ConfigDict(from_attributes=True)