
import logging
from uuid import uuid4

from fastapi import HTTPException, status

from app.core.config import SUPABASE_URL


logger = logging.getLogger(__name__)

BUCKET = "product-images"
MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8 MB

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def validate_image(file_bytes: bytes, content_type: str) -> str:
    """
    Valida tamaño, MIME type y firma real del archivo.
    Devuelve la extensión correspondiente.
    """

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío.",
        )

    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="La imagen no puede superar los 8 MB.",
        )

    extension = ALLOWED_CONTENT_TYPES.get(content_type)

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Formato no permitido. Utiliza JPG, PNG o WebP.",
        )

    # Comprobar la firma del archivo para evitar confiar
    # exclusivamente en el Content-Type enviado por el cliente.
    signatures = {
        "jpg": file_bytes.startswith(b"\xff\xd8\xff"),
        "png": file_bytes.startswith(b"\x89PNG\r\n\x1a\n"),
        "webp": (
            len(file_bytes) >= 12
            and file_bytes[:4] == b"RIFF"
            and file_bytes[8:12] == b"WEBP"
        ),
    }

    if not signatures[extension]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El contenido del archivo no coincide con su formato.",
        )

    return extension


def get_owned_product(product_id: str, seller_id: str, db):
    """
    Comprueba que el producto exista y pertenezca
    al usuario autenticado.
    """

    response = (
        db.table("products")
        .select("id, seller_id, status")
        .eq("id", product_id)
        .eq("seller_id", seller_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado o no tienes permiso para administrarlo.",
        )

    product = response.data[0]

    if product["status"] == "archived":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pueden agregar imágenes a un producto archivado.",
        )

    return product


def build_storage_path(
    seller_id: str,
    product_id: str,
    extension: str,
) -> str:
    """
    Construye una ruta compatible con las políticas RLS de Storage.
    """

    filename = f"{uuid4()}.{extension}"

    return f"{seller_id}/{product_id}/{filename}"


def get_public_image_url(storage_path: str) -> str:
    """
    Construye la URL pública de una imagen.
    """

    encoded_path = "/".join(
        __import__("urllib.parse", fromlist=["quote"]).quote(
            segment,
            safe="",
        )
        for segment in storage_path.split("/")
    )

    return (
        f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/"
        f"{BUCKET}/{encoded_path}"
    )


def upload_product_image(
    product_id: str,
    seller_id: str,
    file_bytes: bytes,
    content_type: str,
    db,
) -> dict:
    """
    Sube una imagen a Supabase Storage y registra
    su referencia en public.product_images.
    """

    # 1. Validar archivo.
    extension = validate_image(file_bytes, content_type)

    # 2. Validar propiedad y estado del producto.
    get_owned_product(
        product_id=product_id,
        seller_id=seller_id,
        db=db,
    )

    # 3. Obtener la siguiente posición disponible.
    positions_response = (
        db.table("product_images")
        .select("position")
        .eq("product_id", product_id)
        .order("position", desc=True)
        .limit(1)
        .execute()
    )

    if positions_response.data:
        position = positions_response.data[0]["position"] + 1
    else:
        position = 0

    # 4. Construir ruta única.
    storage_path = build_storage_path(
        seller_id=seller_id,
        product_id=product_id,
        extension=extension,
    )

    storage = db.storage.from_(BUCKET)

    # 5. Subir archivo.
    try:
        storage.upload(
            path=storage_path,
            file=file_bytes,
            file_options={
                "content-type": content_type,
                "cache-control": "31536000",
                "upsert": "false",
            },
        )

    except Exception as exc:
        logger.exception("Error al subir imagen a Supabase Storage")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No se pudo subir la imagen al almacenamiento.",
        ) from exc

    # 6. Registrar imagen en PostgreSQL.
    try:
        response = (
            db.table("product_images")
            .insert({
                "product_id": product_id,
                "storage_path": storage_path,
                "position": position,
            })
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Supabase no devolvió el registro de la imagen."
            )

        image = response.data[0]

    except Exception as exc:
        logger.exception("Error al registrar imagen en PostgreSQL")

        # Si falla PostgreSQL, intentar eliminar el archivo
        # para evitar objetos huérfanos en Storage.
        try:
            storage.remove([storage_path])
        except Exception:
            logger.exception(
                "No se pudo limpiar el archivo huérfano: %s",
                storage_path,
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="La imagen se subió, pero no se pudo registrar.",
        ) from exc

    # 7. Devolver registro y URL pública.
    return {
        **image,
        "url": get_public_image_url(storage_path),
    }




def list_product_images(product_id: str, db) -> list[dict]:
    product_response = (
        db.table("products")
        .select("id")
        .eq("id", product_id)
        .limit(1)
        .execute()
    )

    if not product_response.data:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado o no tienes permiso para consultarlo.",
        )

    response = (
        db.table("product_images")
        .select("id, product_id, storage_path, position, created_at")
        .eq("product_id", product_id)
        .order("position")
        .execute()
    )

    return [
        {
            **image,
            "url": get_public_image_url(image["storage_path"]),
        }
        for image in response.data
    ]