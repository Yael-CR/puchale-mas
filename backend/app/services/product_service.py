
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from app.core.supabase import supabase
from app.schemas.product import ProductCreate, ProductUpdate


ALLOWED_CREATION_ROLES = {"seller", "admin", "super_admin"}



def get_products() -> list[dict[str, Any]]:
    """Obtiene productos publicados para el catálogo público."""
    try:
        response = (
            supabase.table("products")
            .select(
                "id, seller_id, title, description, condition, "
                "status, created_at, updated_at"
            )
            .eq("status", "published")
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudieron consultar los productos.",
        ) from exc





def get_my_products(
    seller_id: str,
    db: Client,
) -> list[dict[str, Any]]:
    """Obtiene los productos del vendedor autenticado, incluidos sus borradores."""
    try:
        response = (
            db.table("products")
            .select(
                "id, seller_id, title, description, condition, "
                "status, created_at, updated_at"
            )
            .eq("seller_id", seller_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudieron consultar tus productos.",
        ) from exc






def create_product(
    product: ProductCreate,
    seller_id: str,
    db: Client,
) -> dict[str, Any]:
    """Comprueba perfil y rol antes de insertar un producto."""

    try:
        # 1. Confirmar que el usuario tiene un perfil.
        profile_response = (
            db.table("profiles")
            .select("id")
            .eq("id", seller_id)
            .limit(1)
            .execute()
        )

        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario no tiene un perfil autorizado.",
            )

        # 2. Obtener los roles asignados al usuario.
        roles_response = (
            db.table("user_roles")
            .select("roles(code)")
            .eq("user_id", seller_id)
            .execute()
        )

        role_codes = {
            item["roles"]["code"]
            for item in (roles_response.data or [])
            if item.get("roles") and item["roles"].get("code")
        }

        if not role_codes.intersection(ALLOWED_CREATION_ROLES):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu rol no permite crear productos.",
            )

        # 3. El vendedor se obtiene de la identidad autenticada,
        # nunca de un seller_id proporcionado por el cliente.
        product_data = {
            "seller_id": seller_id,
            "title": product.title,
            "description": product.description,
            "condition": product.condition,
            "status": "draft",
        }

        response = (
            db.table("products")
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
        # No devolver al cliente detalles internos de Supabase.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo validar el permiso o crear el producto.",
        ) from exc


def publish_product(
    product_id: str,
    seller_id: str,
    db: Client,
) -> dict[str, Any]:
    """Publica un producto propio mediante una función SQL segura."""

    try:
        response = db.rpc(
            "publish_product",
            {"p_product_id": product_id},
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se pudo publicar el producto.",
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo publicar el producto.",
        ) from exc



def update_product(
    product_id: str,
    seller_id: str,
    product: ProductUpdate,
    db: Client,
) -> dict[str, Any]:
    """Actualiza campos permitidos de un producto propio."""

    changes = product.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes proporcionar al menos un campo para actualizar.",
        )

    try:
        # Verificar que el producto pertenece al usuario.
        product_response = (
            db.table("products")
            .select("id, seller_id, status")
            .eq("id", product_id)
            .eq("seller_id", seller_id)
            .limit(1)
            .execute()
        )

        if not product_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado entre tus productos.",
            )

        # Actualizar únicamente los campos enviados.
        response = (
            db.table("products")
            .update(changes)
            .eq("id", product_id)
            .eq("seller_id", seller_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se pudo actualizar el producto.",
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar el producto.",
        ) from exc



def archive_product(
    product_id: str,
    seller_id: str,
    db: Client,
) -> dict[str, Any]:
    """Archiva un producto propio publicado mediante una función SQL segura."""
    try:
        response = db.rpc(
            "archive_product",
            {"p_product_id": product_id},
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se pudo archivar el producto.",
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as exc:
        error_code = getattr(exc, "code", None)
        error_message = str(exc).lower()

        if (
            error_code == "42501"
            or "rol no autorizado para archivar" in error_message
            or "permission denied" in error_message
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para archivar este producto.",
            ) from exc

        if error_code == "P0001" or (
            "producto no encontrado o no está publicado" in error_message
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El producto no existe, no te pertenece o no está publicado.",
            ) from exc

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo archivar el producto.",
        ) from exc
