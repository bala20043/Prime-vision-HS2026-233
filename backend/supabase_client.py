import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL", "https://kkgdaxuxdwqzktzanflq.supabase.co")
key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if url and key:
    supabase: Client = create_client(url, key)
else:
    supabase = None
