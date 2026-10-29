
from typing import Any

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_current_user
from app.schemas.product import ProductCreate, ProductResponse
from app.services.product_service import create_product, get_products

router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


@router.get(
    "",
    response_model=list[ProductResponse],
)
def list_products() -> list[dict[str, Any]]:
    """Lista los productos disponibles en la tabla."""

    return get_products()


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_product(
    product: ProductCreate,
    user: Any = Depends(get_current_user),
) -> dict[str, Any]:
    """Crea un producto asociado al usuario autenticado."""

    return create_product(
        product=product,
        seller_id=user.id,
    )
