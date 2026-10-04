from pydantic import BaseModel, ConfigDict


class TeacherAssignmentCreate(BaseModel):
    teacher_id: int
    class_id: int
    section_id: int
    subject_id: int
    academic_year_id: int


class TeacherAssignmentUpdate(BaseModel):
    teacher_id: int
    class_id: int
    section_id: int
    subject_id: int
    academic_year_id: int


class TeacherAssignmentResponse(BaseModel):
    id: int
    teacher_id: int
    class_id: int
    section_id: int
    subject_id: int
    academic_year_id: int

    model_config = ConfigDict(from_attributes=True)