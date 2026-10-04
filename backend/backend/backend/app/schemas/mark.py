from pydantic import BaseModel, ConfigDict


class MarkCreate(BaseModel):
    exam_subject_id: int
    student_id: int
    marks_obtained: int
    grade: str | None = None
    remarks: str | None = None


class MarkUpdate(BaseModel):
    marks_obtained: int
    grade: str | None = None
    remarks: str | None = None


class MarkResponse(BaseModel):
    id: int
    exam_subject_id: int
    student_id: int
    marks_obtained: int
    grade: str | None
    remarks: str | None

    model_config = ConfigDict(from_attributes=True)