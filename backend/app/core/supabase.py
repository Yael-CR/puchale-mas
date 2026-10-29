
from supabase import Client, create_client

from app.core.config import (
    SUPABASE_KEY,
    SUPABASE_URL,
    validate_supabase_config,
)


validate_supabase_config()

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
)
