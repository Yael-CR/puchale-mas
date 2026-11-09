from uuid import UUID

from fastapi import APIRouter

from app.schemas.auction_product_query import (
    AuctionWithProductResponse,
)
from app.services.auction_product_query_service import (
    get_auction_with_product,
    get_auctions_with_products,
)


router = APIRouter(
    prefix="/api/auction-catalog",
    tags=["Auction Product Queries"],
)


@router.get(
    "",
    response_model=list[AuctionWithProductResponse],
)
def list_auctions_with_products():
    """Lista las subastas públicas junto con sus productos."""

    return get_auctions_with_products()


@router.get(
    "/{auction_id}",
    response_model=AuctionWithProductResponse,
)
def auction_with_product(auction_id: UUID):
    """Obtiene una subasta pública junto con su producto."""

    return get_auction_with_product(
        auction_id=str(auction_id),
    )