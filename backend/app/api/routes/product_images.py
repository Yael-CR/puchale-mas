
from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.api.dependencies import (
    AuthenticatedUser,
    get_current_user,
    get_optional_current_user,
)
from app.core.supabase import supabase

from app.schemas.product_image import (
    ProductImageResponse,
    ProductImageReorder,
    ProductImageReorderResponse,
)

from app.services.product_image_service import (
    MAX_IMAGE_SIZE,
    list_product_images,
    reorder_product_images,
    delete_product_image,
    replace_product_image,
    upload_product_image,
)


router = APIRouter(
    prefix="/api/products",
    tags=["Product images"],
)


# ============================================================
# SUBIR IMAGEN
# ============================================================

@router.post(
    "/{product_id}/images",
    response_model=ProductImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_image(
    product_id: UUID,
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    file_bytes = file.file.read(MAX_IMAGE_SIZE + 1)

    return upload_product_image(
        product_id=str(product_id),
        seller_id=user.id,
        file_bytes=file_bytes,
        content_type=file.content_type or "",
        db=user.db,
    )


# ============================================================
# CONSULTAR GALERÍA
# ============================================================

@router.get(
    "/{product_id}/images",
    response_model=list[ProductImageResponse],
)
def get_product_images(
    product_id: UUID,
    user: AuthenticatedUser | None = Depends(get_optional_current_user),
):
    db = user.db if user else supabase

    return list_product_images(
        product_id=str(product_id),
        db=db,
    )


# ============================================================
# REORDENAR IMÁGENES
# IMPORTANTE: Esta ruta debe estar antes de {image_id}.
# ============================================================

@router.put(
    "/{product_id}/images/reorder",
    response_model=ProductImageReorderResponse,
)
def reorder_images(
    product_id: UUID,
    payload: ProductImageReorder,
    user: AuthenticatedUser = Depends(get_current_user),
):
    images = reorder_product_images(
        product_id=str(product_id),
        seller_id=user.id,
        image_ids=[str(image_id) for image_id in payload.image_ids],
        db=user.db,
    )

    return {
        "success": True,
        "message": "Imágenes reordenadas correctamente.",
        "images": images,
    }


# ============================================================
# REEMPLAZAR IMAGEN
# ============================================================

@router.put(
    "/{product_id}/images/{image_id}",
    response_model=ProductImageResponse,
)
def replace_image(
    product_id: UUID,
    image_id: UUID,
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    file_bytes = file.file.read(MAX_IMAGE_SIZE + 1)

    return replace_product_image(
        product_id=str(product_id),
        image_id=str(image_id),
        seller_id=user.id,
        file_bytes=file_bytes,
        content_type=file.content_type or "",
        db=user.db,
    )


# ============================================================
# ELIMINAR IMAGEN
# ============================================================

@router.delete(
    "/{product_id}/images/{image_id}",
)
def delete_image(
    product_id: UUID,
    image_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
):
    return delete_product_image(
        product_id=str(product_id),
        image_id=str(image_id),
        seller_id=user.id,
        db=user.db,
    )
