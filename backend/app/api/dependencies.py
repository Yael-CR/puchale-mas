
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client
from supabase_auth.errors import AuthApiError

from app.core.config import SUPABASE_KEY, SUPABASE_URL
from app.core.supabase import supabase

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class AuthenticatedUser:
    id: str
    email: str | None
    access_token: str
    db: Client


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> AuthenticatedUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere un token Bearer válido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        response = supabase.auth.get_user(token)
        user = response.user
    except AuthApiError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo identificar al usuario.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear un cliente por solicitud para que las consultas PostgREST
    # utilicen el JWT de este usuario y respeten sus políticas RLS.
    user_db = create_client(SUPABASE_URL, SUPABASE_KEY)
    user_db.postgrest.auth(token)

    return AuthenticatedUser(
        id=str(user.id),
        email=user.email,
        access_token=token,
        db=user_db,
    )
