
from typing import Any

from fastapi import APIRouter, Depends, status

from app.api.dependencies import AuthenticatedUser, get_current_user
from app.schemas.product import ProductCreate, ProductResponse
from app.services.product_service import (
    create_product,
    get_my_products,
    get_products,
)

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=list[ProductResponse])
def list_products() -> list[dict[str, Any]]:
    """Lista los productos publicados del catálogo público."""
    return get_products()


@router.get("/mine", response_model=list[ProductResponse])
def list_my_products(
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[dict[str, Any]]:
    """Lista los productos del usuario autenticado."""
    return get_my_products(
        seller_id=user.id,
        db=user.db,
    )


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_product(
    product: ProductCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Crea un producto para el usuario autenticado."""
    return create_product(
        product=product,
        seller_id=user.id,
        db=user.db,
    )
