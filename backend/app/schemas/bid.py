
from uuid import UUID

from pydantic import BaseModel


class BidRequestCreate(BaseModel):
    idempotency_key: UUID
