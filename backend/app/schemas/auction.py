
from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


AuctionType = Literal["standard", "express", "exclusive"]

AuctionStatus = Literal[
    "draft",
    "scheduled",
    "active",
    "closing",
    "finished",
    "no_winner",
    "cancelled",
]


class AuctionCreate(BaseModel):
    """Datos que el vendedor puede enviar para crear una subasta."""

    model_config = ConfigDict(extra="forbid")

    product_id: UUID
    type: AuctionType

    starting_price: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    increment_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    max_bid_amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)

    currency: Literal["MXN"] = "MXN"

    starts_at: datetime | None = None
    ends_at: datetime | None = None

    duration_option_id: UUID | None = None
    exclusive_plan_code: str | None = Field(default=None, max_length=100)

    @field_validator("exclusive_plan_code")
    @classmethod
    def validate_exclusive_plan_code(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError("El código del plan no puede estar vacío.")

        return value

    @model_validator(mode="after")
    def validate_auction_configuration(self):
        if self.max_bid_amount < self.starting_price:
            raise ValueError(
                "El importe máximo debe ser igual o superior al precio inicial."
            )

        if self.type == "standard":
            if self.starts_at is None or self.ends_at is None:
                raise ValueError(
                    "Las subastas estándar requieren fecha de inicio y finalización."
                )

            if self.duration_option_id is not None:
                raise ValueError(
                    "Las subastas estándar no utilizan opciones de duración exprés."
                )

            if self.exclusive_plan_code is not None:
                raise ValueError(
                    "Las subastas estándar no requieren un plan exclusivo."
                )

        elif self.type == "express":
            if self.duration_option_id is None:
                raise ValueError(
                    "Las subastas exprés requieren una opción de duración."
                )

            if self.starts_at is not None or self.ends_at is not None:
                raise ValueError(
                    "Las fechas de las subastas exprés son calculadas por el servidor."
                )

            if self.exclusive_plan_code is not None:
                raise ValueError(
                    "Las subastas exprés no requieren un plan exclusivo."
                )

        elif self.type == "exclusive":
            if self.starts_at is None or self.ends_at is None:
                raise ValueError(
                    "Las subastas exclusivas requieren fecha de inicio y finalización."
                )

            if self.exclusive_plan_code is None:
                raise ValueError(
                    "Las subastas exclusivas requieren un plan de membresía."
                )

            if self.duration_option_id is not None:
                raise ValueError(
                    "Las subastas exclusivas no utilizan opciones de duración exprés."
                )

        if self.starts_at is not None and self.ends_at is not None:
            if self.starts_at.tzinfo is None or self.ends_at.tzinfo is None:
                raise ValueError(
                    "Las fechas deben incluir información de zona horaria."
                )

            if self.ends_at <= self.starts_at:
                raise ValueError(
                    "La fecha de finalización debe ser posterior a la de inicio."
                )

        return self


class AuctionUpdate(BaseModel):
    """Campos permitidos al modificar una subasta propia."""

    model_config = ConfigDict(extra="forbid")

    starting_price: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )

    increment_amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    max_bid_amount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )

    starts_at: datetime | None = None
    ends_at: datetime | None = None

    exclusive_plan_code: str | None = Field(default=None, max_length=100)

    @field_validator("exclusive_plan_code")
    @classmethod
    def validate_exclusive_plan_code(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError("El código del plan no puede estar vacío.")

        return value


class AuctionResponse(BaseModel):
    """Datos de una subasta que devuelve la API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    seller_id: UUID

    type: AuctionType
    status: AuctionStatus

    starts_at: datetime | None
    ends_at: datetime | None

    starting_price: Decimal
    increment_amount: Decimal
    max_bid_amount: Decimal
    currency: str
    current_price: Decimal

    last_bid_id: UUID | None
    winner_id: UUID | None

    duration_option_id: UUID | None
    duration_seconds_snapshot: int | None
    exclusive_plan_code: str | None

    created_at: datetime
    published_at: datetime | None
    closed_at: datetime | None
    updated_at: datetime
