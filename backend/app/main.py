
from fastapi import FastAPI

app = FastAPI(
    title="Puchale+ API",
    description="API para la plataforma de subastas Puchale+",
    version="0.1.0",
)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "Puchale+ API funcionando correctamente",
    }
