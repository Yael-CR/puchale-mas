
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    storage_path: str = Field(min_length=1)
    position: int = Field(ge=0)
    created_at: datetime
    url: str


class ProductImageReorder(BaseModel):
    model_config = ConfigDict(extra="forbid")

    image_ids: list[UUID] = Field(min_length=1)
