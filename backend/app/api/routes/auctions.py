
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import AuthenticatedUser, get_current_user
from app.schemas.auction import (
    AuctionCreate,
    AuctionResponse,
    AuctionUpdate,
)
from app.schemas.bid import BidRequestCreate
from app.services.auction_service import (
    create_auction,
    publish_auction,
    update_auction,
)
from app.services.bid_service import enqueue_bid_request


router = APIRouter(
    prefix="/api/auctions",
    tags=["Auctions"],
)


@router.post(
    "",
    response_model=AuctionResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_auction(
    auction: AuctionCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Crea una subasta como borrador."""

    return create_auction(
        auction=auction,
        seller_id=user.id,
        db=user.db,
    )


@router.post(
    "/{auction_id}/publish",
    response_model=AuctionResponse,
)
def publish_auction_endpoint(
    auction_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Publica una subasta."""

    return publish_auction(
        auction_id=auction_id,
        db=user.db,
    )


@router.patch(
    "/{auction_id}",
    response_model=AuctionResponse,
)
def edit_auction(
    auction_id: str,
    auction: AuctionUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Actualiza una subasta propia que todavía está en borrador."""

    return update_auction(
        auction_id=auction_id,
        auction=auction,
        db=user.db,
    )


@router.post(
    "/{auction_id}/bids",
    status_code=status.HTTP_202_ACCEPTED,
)
def request_bid(
    auction_id: UUID,
    bid: BidRequestCreate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Registra una solicitud de puja."""

    return enqueue_bid_request(
        auction_id=auction_id,
        idempotency_key=bid.idempotency_key,
        db=user.db,
    )
