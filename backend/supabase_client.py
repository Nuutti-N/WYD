from supabase_client import create_client, Client
from backend.config import settings

supabase: Client = create_client(settings.SUPABASE_KEY, settings.SUPABASE_URL)
