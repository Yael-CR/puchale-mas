
import os
from pathlib import Path

from dotenv import load_dotenv


# Directorio raíz del backend
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Cargar las variables del archivo .env
load_dotenv(BACKEND_DIR / ".env")

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def validate_supabase_config() -> None:
    """Comprueba que la configuración de Supabase esté completa."""

    missing_variables = []

    if not SUPABASE_URL:
        missing_variables.append("SUPABASE_URL")

    if not SUPABASE_KEY:
        missing_variables.append("SUPABASE_KEY")

    if missing_variables:
        variables = ", ".join(missing_variables)
        raise RuntimeError(
            f"Faltan variables de entorno de Supabase: {variables}"
        )
