from typing import Any

from fastapi import HTTPException, status

from app.core.supabase import supabase


def get_auctions_with_products() -> list[dict[str, Any]]:
    """Obtiene las subastas públicas junto con sus productos."""

    response = (
        supabase.table("auctions")
        .select(
            """
            id,
            product_id,
            seller_id,
            type,
            status,
            starting_price,
            increment_amount,
            max_bid_amount,
            currency,
            current_price,
            product:products!auctions_product_seller_fk (
                id,
                title,
                description,
                condition,
                status
            )
            """
        )
        .in_("type", ["standard", "express"])
        .in_(
            "status",
            ["scheduled", "active", "closing", "finished", "no_winner"],
        )
        .order("created_at", desc=True)
        .execute()
    )

    return response.data or []


def get_auction_with_product(
    auction_id: str,
) -> dict[str, Any]:
    """Obtiene una subasta pública junto con su producto."""

    response = (
        supabase.table("auctions")
        .select(
            """
            id,
            product_id,
            seller_id,
            type,
            status,
            starting_price,
            increment_amount,
            max_bid_amount,
            currency,
            current_price,
            product:products!auctions_product_seller_fk (
                id,
                title,
                description,
                condition,
                status
            )
            """
        )
        .eq("id", auction_id)
        .in_("type", ["standard", "express"])
        .in_(
            "status",
            ["scheduled", "active", "closing", "finished", "no_winner"],
        )
        .maybe_single()
        .execute()
    )

    if response is None or not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subasta no encontrada.",
        )

    return response.data