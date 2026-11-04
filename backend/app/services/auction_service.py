
from typing import Any

from fastapi import HTTPException, status
from supabase import Client
from decimal import Decimal


from app.core.supabase import supabase
from app.schemas.auction import AuctionCreate, AuctionUpdate


def get_auctions() -> list[dict[str, Any]]:
    """Obtiene las subastas públicas."""

    try:
        response = (
            supabase.table("auctions")
            .select("*")
            .in_("type", ["standard", "express"])
            .in_("status", ["scheduled", "active", "closing", "finished", "no_winner"])
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudieron consultar las subastas.",
        ) from exc


def get_my_auctions(
    seller_id: str,
    db: Client,
) -> list[dict[str, Any]]:
    """Obtiene las subastas del vendedor autenticado."""

    try:
        response = (
            db.table("auctions")
            .select("*")
            .eq("seller_id", seller_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudieron consultar tus subastas.",
        ) from exc


def create_auction(
    auction: AuctionCreate,
    seller_id: str,
    db: Client,
) -> dict[str, Any]:
    """Crea una subasta en borrador mediante la función SQL segura."""

    try:
        response = db.rpc(
            "create_auction",
            {
                "p_product_id": str(auction.product_id),
                "p_type": auction.type,
                "p_starting_price": str(auction.starting_price),
                "p_increment_amount": str(auction.increment_amount),
                "p_max_bid_amount": str(auction.max_bid_amount),
                "p_currency": auction.currency,
                "p_starts_at": (
                    auction.starts_at.isoformat()
                    if auction.starts_at is not None
                    else None
                ),
                "p_ends_at": (
                    auction.ends_at.isoformat()
                    if auction.ends_at is not None
                    else None
                ),
                "p_duration_option_id": (
                    str(auction.duration_option_id)
                    if auction.duration_option_id is not None
                    else None
                ),
                "p_exclusive_plan_code": auction.exclusive_plan_code,
            },
        ).execute()

        data = response.data

        if isinstance(data, list):
            if not data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Supabase no devolvió la subasta creada.",
                )
            return data[0]

        if isinstance(data, dict):
            return data

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="La respuesta de Supabase no contiene la subasta creada.",
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo crear la subasta.",
        ) from exc




def update_auction(
    auction_id: str,
    auction: AuctionUpdate,
    db: Client,
) -> dict[str, Any]:
    """Actualiza una subasta mediante la función segura de Supabase."""

    changes = auction.model_dump(
        mode="json",
        exclude_unset=True,
    )

    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes proporcionar al menos un campo para actualizar.",
        )

    numeric_fields = {
        "starting_price",
        "increment_amount",
        "max_bid_amount",
    }

    for field in numeric_fields:
        if field in changes and changes[field] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El campo {field} no puede ser nulo.",
            )

    params = {
        "p_auction_id": auction_id,
        "p_starting_price": changes.get("starting_price"),
        "p_increment_amount": changes.get("increment_amount"),
        "p_max_bid_amount": changes.get("max_bid_amount"),
        "p_starts_at": changes.get("starts_at"),
        "p_ends_at": changes.get("ends_at"),
        "p_exclusive_plan_code": changes.get("exclusive_plan_code"),
        "p_update_exclusive_plan_code": (
            "exclusive_plan_code" in changes
        ),
    }

    try:
        response = db.rpc(
            "update_auction_draft",
            params,
        ).execute()

        data = response.data

        if isinstance(data, list) and data:
            return data[0]

        if isinstance(data, dict):
            return data

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se pudo encontrar la subasta actualizada.",
        )

    except HTTPException:
        raise

    
    except Exception as exc:
        error_message = str(exc)

        print("ERROR REAL AL ACTUALIZAR SUBASTA:", repr(exc))

        expected_errors = [
            "El precio inicial no es válido.",
            "El incremento no es válido.",
            "El importe máximo debe ser igual o superior al precio inicial.",
            "La fecha de finalización debe ser posterior a la de inicio.",
            "Las subastas exclusivas requieren un plan de membresía.",
            "No se puede modificar una subasta que ya tiene pujas.",
            "No tienes permiso para modificar esta subasta.",
            "La subasta no existe.",
        ]

        for message in expected_errors:
            if message in error_message:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=message,
                ) from exc

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo actualizar la subasta. Verifica los datos.",
        ) from exc



def publish_auction(
    auction_id: str,
    db: Client,
) -> dict[str, Any]:
    """Publica una subasta mediante la función SQL segura de Supabase."""

    try:
        response = db.rpc(
            "publish_auction",
            {"p_auction_id": auction_id},
        ).execute()

        data = response.data

        if isinstance(data, list) and data:
            return data[0]

        if isinstance(data, dict):
            return data

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase no devolvió la subasta publicada.",
        )

    except HTTPException:
        raise

    except Exception as exc:
        error_message = str(exc)

        expected_errors = [
            "Se requiere autenticación.",
            "La subasta no existe.",
            "No tienes permiso para publicar esta subasta.",
            "Tu rol no permite publicar subastas.",
            "La subasta no está en estado de borrador.",
            "El producto no existe, no te pertenece o no está publicado.",
            "La configuración de precios no es válida.",
            "Las fechas de la subasta estándar no son válidas.",
            "La configuración de la subasta estándar no es válida.",
            "No se puede publicar una subasta cuyo periodo ya terminó.",
            "La duración de la subasta exprés no es válida.",
            "La configuración de la subasta exprés no es válida.",
            "La opción de duración no existe o está deshabilitada.",
            "Las fechas de la subasta exclusiva no son válidas.",
            "La configuración de la subasta exclusiva no es válida.",
            "Las subastas exclusivas requieren un plan de membresía.",
            "El tipo de subasta no es válido.",
        ]

        for message in expected_errors:
            if message in error_message:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=message,
                ) from exc

        print("ERROR REAL AL PUBLICAR SUBASTA:", repr(exc))

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo publicar la subasta.",
        ) from exc