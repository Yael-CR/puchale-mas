
import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any

from app.core.supabase_admin import supabase_admin

logger = logging.getLogger("puchale.bid_worker")

WORKER_ID = str(uuid.uuid4())
POLL_INTERVAL_SECONDS = 0.5
BATCH_SIZE = 100


def log_event(event: str, **details: Any) -> None:
    logger.info(
        json.dumps(
            {
                "event": event,
                "worker_id": WORKER_ID,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                **details,
            },
            ensure_ascii=False,
            default=str,
        )
    )


def normalize_rpc_result(data: Any) -> dict[str, Any] | None:
    if isinstance(data, list):
        return data[0] if data else None

    if isinstance(data, dict):
        return data

    return None


def process_auction_queue(auction_id: str) -> int:
    processed = 0

    while True:
        claim_response = supabase_admin.rpc(
            "claim_bid_request",
            {"p_auction_id": auction_id},
        ).execute()

        request = normalize_rpc_result(claim_response.data)

        if not request:
            break

        request_id = request["id"]
        processing_token = request.get("processing_token")

        if not processing_token:
            log_event(
                "claim_without_token",
                auction_id=auction_id,
                request_id=request_id,
            )
            break

        try:
            result = supabase_admin.rpc(
                "process_bid_request",
                {
                    "p_request_id": request_id,
                    "p_processing_token": processing_token,
                },
            ).execute()

            processed_request = normalize_rpc_result(result.data)

            log_event(
                "request_processed",
                auction_id=auction_id,
                request_id=request_id,
                status=(
                    processed_request.get("status")
                    if processed_request
                    else "unknown"
                ),
            )

            processed += 1

        except Exception as exc:
            # No se marca como rechazada una falla técnica.
            # El bloqueo vencerá y otro ciclo podrá recuperarla.
            log_event(
                "request_processing_error",
                auction_id=auction_id,
                request_id=request_id,
                error=str(exc),
            )
            break

    return processed





def close_due_auction(auction_id: str) -> bool:
    # Verificar que no queden solicitudes pendientes.
    pending_response = (
        supabase_admin.table("bid_requests")
        .select("id")
        .eq("auction_id", auction_id)
        .in_("status", ["queued", "processing"])
        .limit(1)
        .execute()
    )

    if pending_response.data:
        log_event(
            "auction_close_waiting_for_requests",
            auction_id=auction_id,
        )
        return False

    try:
        response = supabase_admin.rpc(
            "close_auction",
            {"p_auction_id": auction_id},
        ).execute()

        auction = normalize_rpc_result(response.data)

        log_event(
            "auction_closed",
            auction_id=auction_id,
            status=auction.get("status") if auction else "unknown",
            winner_id=auction.get("winner_id") if auction else None,
            final_price=auction.get("current_price") if auction else None,
        )

        return True

    except Exception as exc:
        log_event(
            "auction_close_error",
            auction_id=auction_id,
            error=str(exc),
        )
        return False










async def run_worker_cycle() -> int:
    # Buscar solicitudes pendientes.
    response = (
        supabase_admin.table("bid_requests")
        .select("auction_id")
        .in_("status", ["queued", "processing"])
        .order("received_at")
        .limit(BATCH_SIZE)
        .execute()
    )

    auction_ids = list(
        dict.fromkeys(
            row["auction_id"]
            for row in (response.data or [])
        )
    )

    # Buscar subastas que ya llegaron a su hora de cierre.
    now_iso = datetime.now(timezone.utc).isoformat()

    due_response = (
        supabase_admin.table("auctions")
        .select("id")
        .in_("status", ["active", "closing"])
        .lte("ends_at", now_iso)
        .order("ends_at")
        .limit(BATCH_SIZE)
        .execute()
    )

    due_auction_ids = [
        row["id"]
        for row in (due_response.data or [])
    ]

    # Incluir también las subastas vencidas en el procesamiento.
    all_auction_ids = list(
        dict.fromkeys(auction_ids + due_auction_ids)
    )

    results = await asyncio.gather(
        *[
            asyncio.to_thread(process_auction_queue, auction_id)
            for auction_id in all_auction_ids
        ],
        return_exceptions=True,
    )

    total_processed = 0

    for auction_id, result in zip(all_auction_ids, results):
        if isinstance(result, Exception):
            log_event(
                "auction_queue_error",
                auction_id=auction_id,
                error=str(result),
            )
        else:
            total_processed += result

    # Intentar cerrar las subastas vencidas.
    if due_auction_ids:
        await asyncio.gather(
            *[
                asyncio.to_thread(close_due_auction, auction_id)
                for auction_id in due_auction_ids
            ],
            return_exceptions=True,
        )

    return total_processed








async def bid_worker_loop() -> None:
    log_event("worker_started")

    while True:
        cycle_started = time.monotonic()

        try:
            total_processed = await run_worker_cycle()

            log_event(
                "worker_cycle_completed",
                processed=total_processed,
                duration_ms=round(
                    (time.monotonic() - cycle_started) * 1000,
                    2,
                ),
            )

        except asyncio.CancelledError:
            log_event("worker_stopping")
            raise

        except Exception as exc:
            log_event(
                "worker_cycle_error",
                error=str(exc),
            )

        await asyncio.sleep(POLL_INTERVAL_SECONDS)
