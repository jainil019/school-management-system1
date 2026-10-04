from datetime import date

from pydantic import BaseModel, ConfigDict


class ExamSubjectCreate(BaseModel):
    examination_id: int
    class_id: int
    subject_id: int
    max_marks: int
    passing_marks: int
    exam_date: date


class ExamSubjectUpdate(BaseModel):
    max_marks: int
    passing_marks: int
    exam_date: date


class ExamSubjectResponse(BaseModel):
    id: int
    examination_id: int
    class_id: int
    subject_id: int
    max_marks: int
    passing_marks: int
    exam_date: date

    model_config = ConfigDict(from_attributes=True)