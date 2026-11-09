from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuctionProductResponse(BaseModel):
    """Información del producto asociado a una subasta."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None = None
    condition: str | None = None
    status: str


class AuctionWithProductResponse(BaseModel):
    """Subasta acompañada de la información de su producto."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    seller_id: UUID
    type: str
    status: str
    starting_price: float
    increment_amount: float
    max_bid_amount: float
    currency: str
    current_price: float
    product: AuctionProductResponse