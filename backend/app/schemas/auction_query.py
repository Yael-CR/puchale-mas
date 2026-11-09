
from datetime import datetime
from decimal import Decimal
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
