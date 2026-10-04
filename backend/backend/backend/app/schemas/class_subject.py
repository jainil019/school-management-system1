from pydantic import BaseModel, ConfigDict


class ClassSubjectCreate(BaseModel):
    class_id: int
    subject_id: int


class ClassSubjectResponse(BaseModel):
    id: int
    class_id: int
    subject_id: int

    model_config = ConfigDict(from_attributes=True)