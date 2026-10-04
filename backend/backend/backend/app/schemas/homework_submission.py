from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HomeworkSubmissionCreate(BaseModel):
    homework_id: int
    student_id: int
    file_url: str | None = None


class HomeworkSubmissionUpdate(BaseModel):
    status: str
    feedback: str | None = None


class HomeworkSubmissionResponse(BaseModel):
    id: int
    homework_id: int
    student_id: int
    submitted_at: datetime | None
    file_url: str | None
    status: str
    feedback: str | None
    reviewed_by: int | None

    model_config = ConfigDict(from_attributes=True)