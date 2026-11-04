




from typing import Any

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.api.dependencies import AuthenticatedUser, get_current_user
from app.api.routes.products import router as products_router
from app.api.routes.auctions import router as auctions_router

import asyncio
from contextlib import asynccontextmanager

from app.services.bid_worker import bid_worker_loop





@asynccontextmanager
async def lifespan(app: FastAPI):
    worker_task = asyncio.create_task(bid_worker_loop())

    try:
        yield
    finally:
        worker_task.cancel()

        try:
            await worker_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Puchale+ API",
    version="0.1.0",
    lifespan=lifespan,
)








app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "Puchale+ API funcionando correctamente",
    }



@app.get("/api/auth/me", tags=["Authentication"])
def get_authenticated_user(
    user: AuthenticatedUser = Depends(get_current_user),
):
    return {
        "authenticated": True,
        "user": {
            "id": user.id,
            "email": user.email,
        },
    }



app.include_router(products_router)
app.include_router(auctions_router)