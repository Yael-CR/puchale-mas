
from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuctionBidResponse(BaseModel):
    """Datos de una puja aceptada dentro de una subasta."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    auction_id: UUID
    bidder_id: UUID
    amount: Decimal
    sequence_no: int
    accepted_at: datetime


class BidRequestStatusResponse(BaseModel):
    """Estado de una solicitud de puja."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    auction_id: UUID
    status: Literal[
        "queued",
        "processing",
        "accepted",
        "rejected",
        "expired",
    ]
    rejection_reason: str | None = None
    sequence_no: int | None = None
    received_at: datetime
    processed_at: datetime | None = None
    expired_at: datetime | None = None
