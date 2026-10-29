
from typing import Any

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies import get_current_user

app = FastAPI(
    title="Puchale+ API",
    description="API para la plataforma de subastas Puchale+",
    version="0.1.0",
)

# Permitir solicitudes desde el frontend local de Vite.
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
def get_authenticated_user(user: Any = Depends(get_current_user)):
    return {
        "authenticated": True,
        "user": {
            "id": user.id,
            "email": user.email,
        },
    }







from typing import Any

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies import get_current_user
from app.api.routes.products import router as products_router

app = FastAPI(
    title="Puchale+ API",
    description="API para la plataforma de subastas Puchale+",
    version="0.1.0",
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
def get_authenticated_user(user: Any = Depends(get_current_user)):
    return {
        "authenticated": True,
        "user": {
            "id": user.id,
            "email": user.email,
        },
    }


app.include_router(products_router)
