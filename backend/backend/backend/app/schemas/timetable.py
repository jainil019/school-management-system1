from pydantic import BaseModel, ConfigDict


class TimetableCreate(BaseModel):
    academic_year_id: int
    class_id: int
    section_id: int
    subject_id: int
    teacher_id: int
    day_of_week: str
    start_time: str
    end_time: str
    room: str | None = None


class TimetableUpdate(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    room: str | None = None


class TimetableResponse(BaseModel):
    id: int
    academic_year_id: int
    class_id: int
    section_id: int
    subject_id: int
    teacher_id: int
    day_of_week: str
    start_time: str
    end_time: str
    room: str | None

    model_config = ConfigDict(from_attributes=True)