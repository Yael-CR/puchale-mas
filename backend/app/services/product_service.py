
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status

from app.core.supabase import supabase
from app.schemas.product import ProductCreate


def get_products() -> list[dict[str, Any]]:
    """Obtiene los productos ordenados del más reciente al más antiguo."""

    try:
        response = (
            supabase.table("products")
            .select(
                "id, seller_id, title, description, condition, "
                "status, created_at, updated_at"
            )
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudieron consultar los productos.",
        ) from exc


def create_product(
    product: ProductCreate,
    seller_id: UUID,
) -> dict[str, Any]:
    """Crea un producto asociado al perfil del vendedor autenticado."""

    product_data = {
        "seller_id": str(seller_id),
        "title": product.title,
        "description": product.description,
        "condition": product.condition,
        "status": "draft",
    }

    try:
        response = (
            supabase.table("products")
            .insert(product_data)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Supabase no devolvió el producto creado.",
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo crear el producto.",
        ) from exc
