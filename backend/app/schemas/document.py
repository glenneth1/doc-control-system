from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None


class DocumentCreate(DocumentBase):
    tags: list[str] = []


class DocumentUpdate(DocumentBase):
    tags: list[str] = []


class DocumentVersion(BaseModel):
    id: int
    version_number: int
    file_path: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Document(DocumentBase):
    id: int
    file_path: str
    mime_type: str
    owner_id: int
    created_at: datetime
    updated_at: datetime
    version: int
    tags: list[Tag]
    versions: list[DocumentVersion]
    model_config = ConfigDict(from_attributes=True)


class DocumentInDB(Document):
    pass
