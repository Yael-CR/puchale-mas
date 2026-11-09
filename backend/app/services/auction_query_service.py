
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from supabase import Client

from app.core.supabase import supabase


def get_auctions() -> list[dict[str, Any]]:
    """Obtiene las subastas públicas."""

    response = (
        supabase.table("auctions")
        .select("*")
        .in_("type", ["standard", "express"])
        .in_(
            "status",
            ["scheduled", "active", "closing", "finished", "no_winner"],
        )
        .order("created_at", desc=True)
        .execute()
    )

    return response.data or []


def get_my_auctions(
    seller_id: UUID,
    db: Client,
) -> list[dict[str, Any]]:
    """Obtiene las subastas del usuario autenticado."""

    response = (
        db.table("auctions")
        .select("*")
        .eq("seller_id", str(seller_id))
        .order("created_at", desc=True)
        .execute()
    )

    return response.data or []


def get_auction_detail(
    auction_id: UUID,
    db: Client,
) -> dict[str, Any]:
    """Obtiene el detalle de una subasta."""

    response = (
        db.table("auctions")
        .select("*")
        .eq("id", str(auction_id))
        .maybe_single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subasta no encontrada.",
        )

    return response.data


def get_auction_bids(
    auction_id: UUID,
    db: Client,
) -> list[dict[str, Any]]:
    """Obtiene el historial de pujas aceptadas de una subasta."""

    auction_response = (
        db.table("auctions")
        .select("id")
        .eq("id", str(auction_id))
        .maybe_single()
        .execute()
    )

    if not auction_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subasta no encontrada.",
        )

    response = (
        db.table("bids")
        .select(
            "id, auction_id, bidder_id, amount, sequence_no, accepted_at"
        )
        .eq("auction_id", str(auction_id))
        .order("sequence_no", desc=False)
        .execute()
    )

    return response.data or []
