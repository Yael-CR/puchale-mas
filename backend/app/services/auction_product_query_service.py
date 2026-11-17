
from typing import Any

from fastapi import HTTPException, status

from app.core.supabase import supabase


def _add_product_image_urls(
    auction: dict[str, Any],
) -> dict[str, Any]:
    """Genera las URL públicas de las imágenes del producto."""

    product = auction.get("product")

    if not product:
        return auction

    images = product.get("images") or []

    for image in images:
        storage_path = image.get("storage_path")

        if storage_path:
            image["url"] = (
                supabase.storage
                .from_("product-images")
                .get_public_url(storage_path)
            )

    images.sort(key=lambda image: image.get("position", 0))

    product["images"] = images

    return auction


def get_auctions_with_products() -> list[dict[str, Any]]:
    """Obtiene las subastas públicas junto con sus productos e imágenes."""

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
                status,
                images:product_images (
                    id,
                    storage_path,
                    position,
                    created_at,
                    updated_at
                )
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

    auctions = response.data or []

    return [
        _add_product_image_urls(auction)
        for auction in auctions
    ]


def get_auction_with_product(
    auction_id: str,
) -> dict[str, Any]:
    """Obtiene una subasta pública junto con su producto e imágenes."""

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
                status,
                images:product_images (
                    id,
                    storage_path,
                    position,
                    created_at,
                    updated_at
                )
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

    return _add_product_image_urls(response.data)
