import sqlite3
import os
from datetime import datetime
from supabase_client import supabase

DB_PATH = os.path.join(os.path.dirname(__file__), "college_assistant.db")

def get_db_connection():
    # 30s timeout to prevent locking conflicts
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Enable WAL mode for concurrent read/write access without locking
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
    
    # 1. Try Supabase Auth Admin first
    if supabase:
        try:
            users = supabase.auth.admin.list_users()
            for u in users:
                if u.email.lower() == clean_email:
                    name = u.user_metadata.get("name", "Student User") if u.user_metadata else "Student User"
                    auth_provider = u.app_metadata.get("provider", "email") if u.app_metadata else "email"
                    return {
                        "id": u.id,
                        "name": name,
                        "email": u.email,
                        "auth_provider": auth_provider,
                        "created_at": u.created_at,
                        "last_login": getattr(u, "last_sign_in_at", None)
                    }
        except Exception:
            pass

    # 2. Fallback to local SQLite
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None
    except Exception as e:
        print("SQLite get_user_by_email fallback note:", e)
        return None

def get_user_by_id(user_id: str):
    # 1. Try Supabase Auth Admin first
    if supabase:
        try:
            u = supabase.auth.admin.get_user_by_id(str(user_id))
            if u and hasattr(u, 'user') and u.user:
                usr = u.user
                name = usr.user_metadata.get("name", "Student User") if usr.user_metadata else "Student User"
                auth_provider = usr.app_metadata.get("provider", "email") if usr.app_metadata else "email"
                return {
                    "id": usr.id,
                    "name": name,
                    "email": usr.email,
                    "auth_provider": auth_provider,
                    "created_at": usr.created_at,
                    "last_login": getattr(usr, "last_sign_in_at", None)
                }
        except Exception:
            pass

    # 2. Fallback to local SQLite
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (str(user_id),))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None
    except Exception as e:
        print("SQLite get_user_by_id fallback note:", e)
        return None

def create_user_in_supabase(name: str, email: str, password: str = None, auth_provider: str = "email", provider_user_id: str = None):
    clean_email = email.lower().strip()
    created_at = datetime.utcnow().isoformat()
    supabase_user = None

    # 1. Store directly in Supabase Auth
    if supabase:
        try:
            if password:
                # Register in Supabase Auth with email & password
                res = supabase.auth.admin.create_user({
                    "email": clean_email,
                    "password": password,
                    "user_metadata": {"name": name},
                    "email_confirm": True
                })
                if hasattr(res, 'user') and res.user:
                    supabase_user = res.user
            else:
                # OAuth / Google user registration in Supabase Auth
                res = supabase.auth.admin.create_user({
                    "email": clean_email,
                    "user_metadata": {"name": name, "google_sub": provider_user_id},
                    "app_metadata": {"provider": "google"},
                    "email_confirm": True
                })
                if hasattr(res, 'user') and res.user:
                    supabase_user = res.user
        except Exception as e:
            # Re-raise explicit duplicates
            if "already registered" in str(e).lower() or "already exists" in str(e).lower():
                raise e
            print("Supabase create user notice:", e)

    # Determine user ID and metadata
    user_id = str(supabase_user.id) if supabase_user else f"usr_{int(datetime.utcnow().timestamp())}"
    
    # 2. Sync with local SQLite (with try-except so locking never blocks user registration)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO users (id, name, email, password_hash, auth_provider, provider_user_id, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, clean_email, "SUPABASE_MANAGED" if password else None, auth_provider, provider_user_id, created_at, created_at))
        conn.commit()
        conn.close()
    except Exception as e:
        print("SQLite backup write skipped:", e)

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
