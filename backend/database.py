import sqlite3
import os
from datetime import datetime
from supabase_client import supabase
from auth import hash_password

DB_PATH = os.path.join(os.path.dirname(__file__), "college_assistant.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NULL,
                auth_provider TEXT NOT NULL,
                provider_user_id TEXT NULL,
                created_at TEXT NOT NULL,
                last_login TEXT NULL
            );
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        print("Local DB Init Note:", e)

def get_user_by_email(email: str):
    clean_email = email.lower().strip()
    
    # 1. Check local SQLite (instant < 2ms)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
        user = cursor.fetchone()
        conn.close()
        if user:
            return dict(user)
    except Exception as e:
        print("SQLite get_user_by_email note:", e)

    # 2. Check Supabase Table Editor (public.users)
    if supabase:
        try:
            res = supabase.table("users").select("*").eq("email", clean_email).execute()
            if res and hasattr(res, 'data') and res.data and len(res.data) > 0:
                return res.data[0]
        except Exception:
            pass

    return None

def get_user_by_id(user_id: str):
    sid = str(user_id)
    # 1. Check local SQLite (instant < 2ms)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (sid,))
        user = cursor.fetchone()
        conn.close()
        if user:
            return dict(user)
    except Exception as e:
        print("SQLite get_user_by_id note:", e)

    # 2. Check Supabase Table Editor (public.users)
    if supabase:
        try:
            res = supabase.table("users").select("*").eq("id", sid).execute()
            if res and hasattr(res, 'data') and res.data and len(res.data) > 0:
                return res.data[0]
        except Exception:
            pass

    return None

def create_user_in_supabase(name: str, email: str, password: str = None, auth_provider: str = "email", provider_user_id: str = None):
    clean_email = email.lower().strip()
    created_at = datetime.utcnow().isoformat()
    supabase_user = None
    pwd_hash = hash_password(password) if password else None

    # 1. Register in Supabase Auth
    if supabase:
        try:
            if password:
                res = supabase.auth.admin.create_user({
                    "email": clean_email,
                    "password": password,
                    "user_metadata": {"name": name},
                    "email_confirm": True
                })
                if hasattr(res, 'user') and res.user:
                    supabase_user = res.user
            else:
                res = supabase.auth.admin.create_user({
                    "email": clean_email,
                    "user_metadata": {"name": name, "google_sub": provider_user_id},
                    "app_metadata": {"provider": "google"},
                    "email_confirm": True
                })
                if hasattr(res, 'user') and res.user:
                    supabase_user = res.user
        except Exception as e:
            if "already registered" in str(e).lower() or "already exists" in str(e).lower():
                raise e
            print("Supabase create user notice:", e)

    user_id = str(supabase_user.id) if supabase_user else f"usr_{int(datetime.utcnow().timestamp())}"
    
    # 2. Sync to local SQLite immediately for lightning fast login
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO users (id, name, email, password_hash, auth_provider, provider_user_id, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, clean_email, pwd_hash, auth_provider, provider_user_id, created_at, created_at))
        conn.commit()
        conn.close()
    except Exception as e:
        print("SQLite insert note:", e)

    # 3. Sync to Supabase Table Editor (public.users)
    if supabase:
        try:
            supabase.table("users").upsert({
                "name": name,
                "email": clean_email,
                "password_hash": pwd_hash,
                "auth_provider": auth_provider,
                "provider_user_id": provider_user_id,
                "created_at": created_at,
                "last_login": created_at
            }, on_conflict="email").execute()
        except Exception as e:
            print("Supabase Table Editor insert notice:", e)

    return {
        "id": user_id,
        "name": name,
        "email": clean_email,
        "auth_provider": auth_provider,
        "created_at": created_at,
        "last_login": created_at
    }

def update_last_login(user_id: str):
    now = datetime.utcnow().isoformat()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (str(user_id), now))
        conn.commit()
        conn.close()
    except Exception as e:
        print("SQLite update_last_login note:", e)

    if supabase:
        try:
            supabase.table("users").update({"last_login": now}).eq("email", str(user_id)).execute()
        except Exception:
            pass
