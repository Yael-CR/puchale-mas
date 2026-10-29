
from typing import Any

from fastapi import APIRouter, Depends, status





from app.api.dependencies import AuthenticatedUser, get_current_user
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

from app.services.product_service import (
    create_product,
    get_my_products,
    get_products,
    publish_product,
    update_product,
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



@router.patch("/{product_id}/publish", response_model=ProductResponse)
def publish_my_product(
    product_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Publica un producto propio del usuario autenticado."""
    return publish_product(
        product_id=product_id,
        seller_id=user.id,
        db=user.db,
    )



@router.patch("/{product_id}", response_model=ProductResponse)
def edit_my_product(
    product_id: str,
    product: ProductUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Edita un producto propio del usuario autenticado."""
    return update_product(
        product_id=product_id,
        seller_id=user.id,
        product=product,
        db=user.db,
    )
