
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


ProductStatus = Literal["draft", "published", "archived"]


class ProductCreate(BaseModel):
    """Datos que el cliente puede enviar para crear un producto."""

    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    condition: str | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("El título no puede estar vacío.")

        return value


class ProductResponse(BaseModel):
    """Datos del producto que devuelve la API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    seller_id: UUID
    title: str
    description: str | None
    condition: str | None
    status: ProductStatus
    created_at: datetime
    updated_at: datetime
