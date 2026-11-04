
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from supabase import Client


def enqueue_bid_request(
    auction_id: UUID,
    idempotency_key: UUID,
    db: Client,
) -> dict[str, Any]:

    try:
        response = db.rpc(
            "enqueue_bid_request",
            {
                "p_auction_id": str(auction_id),
                "p_idempotency_key": str(idempotency_key),
            },
        ).execute()

        data = response.data

        if isinstance(data, list):
            data = data[0] if data else None

        if not data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar la solicitud de puja.",
            )

        return data

    except HTTPException:
        raise

    except Exception as exc:
        error = str(exc)

        if "auction_not_found" in error:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La subasta no existe.",
            )

        if "authentication_required" in error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Debes iniciar sesión.",
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo registrar la solicitud de puja.",
        ) from exc
