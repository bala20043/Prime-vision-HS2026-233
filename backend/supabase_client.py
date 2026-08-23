import os
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

supabase = None

if url and key:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(url, key)
        print(f"Supabase connected: {url}")
    except Exception as e:
        print(f"Supabase connection notice: {e}")
        supabase = None
