from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.dependencies import AuthenticatedUser, get_current_user
from app.schemas.auction import AuctionResponse
from app.schemas.auction_query import AuctionBidResponse
from app.services.auction_query_service import (
    get_auction_detail,
    get_auction_bids,
    get_auctions,
    get_my_auctions,
)

router = APIRouter(
    prefix="/api/auctions",
    tags=["Auction Queries"],
)


@router.get("", response_model=list[AuctionResponse])
def list_auctions():
    return get_auctions()


@router.get("/mine", response_model=list[AuctionResponse])
def list_my_auctions(
    user: AuthenticatedUser = Depends(get_current_user),
):
    return get_my_auctions(seller_id=user.id, db=user.db)


@router.get("/{auction_id}", response_model=AuctionResponse)
def auction_detail(
    auction_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
):
    return get_auction_detail(auction_id=auction_id, db=user.db)


@router.get(
    "/{auction_id}/bids",
    response_model=list[AuctionBidResponse],
)
def auction_bids(
    auction_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
):
    return get_auction_bids(auction_id=auction_id, db=user.db)