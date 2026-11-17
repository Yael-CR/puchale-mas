
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client
from supabase.lib.client_options import SyncClientOptions
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


def create_user_db(token: str) -> Client:
    """
    Crea un cliente Supabase asociado al JWT del usuario.

    El JWT se configura en los encabezados del cliente para que
    tanto PostgREST como Storage respeten las políticas RLS.
    """

    options = SyncClientOptions(
        headers={
            "Authorization": f"Bearer {token}",
        }
    )

    return create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
        options=options,
    )


def get_authenticated_user(token: str) -> AuthenticatedUser:
    """
    Valida el token de Supabase y construye el usuario autenticado.
    """

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

    user_db = create_user_db(token)

    return AuthenticatedUser(
        id=str(user.id),
        email=user.email,
        access_token=token,
        db=user_db,
    )


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> AuthenticatedUser:
    """
    Dependencia obligatoria de autenticación.

    Se utiliza en operaciones que requieren un usuario autenticado.
    """

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere un token Bearer válido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return get_authenticated_user(credentials.credentials)


async def get_optional_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> AuthenticatedUser | None:
    """
    Dependencia opcional de autenticación.

    Permite solicitudes públicas sin token, pero valida cualquier
    token que el cliente proporcione.
    """

    if credentials is None:
        return None

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Esquema de autenticación inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return get_authenticated_user(credentials.credentials)
