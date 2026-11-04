
from typing import Any

from fastapi import APIRouter, Depends, status

from app.api.dependencies import AuthenticatedUser, get_current_user
from app.schemas.auction import (
    AuctionCreate,
    AuctionResponse,
    AuctionUpdate,
)

from app.services.auction_service import (
    create_auction,
    get_auctions,
    get_my_auctions,
    update_auction,
)


router = APIRouter(prefix="/api/auctions", tags=["Auctions"])


@router.get("", response_model=list[AuctionResponse])
def list_auctions() -> list[dict[str, Any]]:
    """Lista las subastas públicas."""
    return get_auctions()


@router.get("/mine", response_model=list[AuctionResponse])
def list_my_auctions(
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[dict[str, Any]]:
    """Lista las subastas del vendedor autenticado."""
    return get_my_auctions(
        seller_id=user.id,
        db=user.db,
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