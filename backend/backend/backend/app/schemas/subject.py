from pydantic import BaseModel, ConfigDict


class SubjectCreate(BaseModel):
    name: str
    code: str


class SubjectUpdate(BaseModel):
    name: str
    code: str


class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str

    model_config = ConfigDict(
        from_attributes=True
    )