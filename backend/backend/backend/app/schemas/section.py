from pydantic import BaseModel, ConfigDict


class SectionCreate(BaseModel):
    name: str
    class_id: int


class SectionUpdate(BaseModel):
    name: str
    class_id: int


class SectionResponse(BaseModel):
    id: int
    name: str
    class_id: int

    model_config = ConfigDict(from_attributes=True)