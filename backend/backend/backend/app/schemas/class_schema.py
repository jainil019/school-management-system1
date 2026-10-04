from pydantic import BaseModel, ConfigDict


class ClassCreate(BaseModel):
    name: str
    academic_year_id: int


class ClassUpdate(BaseModel):
    name: str
    academic_year_id: int


class ClassResponse(BaseModel):
    id: int
    name: str
    academic_year_id: int

    model_config = ConfigDict(from_attributes=True)