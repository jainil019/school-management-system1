from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class HomeworkCreate(BaseModel):
    class_id: int
    section_id: int | None = None
    subject_id: int
    teacher_id: int
    title: str
    description: str | None = None
    assigned_date: date
    due_date: date
    attachment_url: str | None = None


class HomeworkUpdate(BaseModel):
    title: str
    description: str | None = None
    due_date: date
    attachment_url: str | None = None


class HomeworkResponse(BaseModel):
    id: int
    class_id: int
    section_id: int | None
    subject_id: int
    teacher_id: int
    title: str
    description: str | None
    assigned_date: date
    due_date: date
    attachment_url: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)