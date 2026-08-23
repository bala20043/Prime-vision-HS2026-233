import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional

# Import Supabase client if available
try:
    from supabase_client import supabase
except ImportError:
    supabase = None

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "college_assistant.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes all database tables (SQLite & Supabase schema aligned)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
        # 1. users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NULL,
                auth_provider TEXT NOT NULL DEFAULT 'email',
                provider_user_id TEXT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                last_login TEXT NULL
            );
        """)

        # 2. knowledge_items table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'General',
                source TEXT NOT NULL DEFAULT 'College Knowledge Base',
                language TEXT NOT NULL DEFAULT 'en',
                active INTEGER NOT NULL DEFAULT 1,
                dataset_version INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        # 3. question_variations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS question_variations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                knowledge_item_id INTEGER NOT NULL,
                variation TEXT NOT NULL,
                language TEXT NOT NULL DEFAULT 'en',
                created_at TEXT NOT NULL,
                FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE
            );
        """)

        # 4. dataset_versions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS dataset_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version_name TEXT NOT NULL,
                filename TEXT NOT NULL,
                uploaded_by TEXT NOT NULL DEFAULT 'admin',
                total_rows INTEGER NOT NULL,
                valid_rows INTEGER NOT NULL,
                invalid_rows INTEGER NOT NULL,
                duplicate_rows INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL,
                activated_at TEXT NOT NULL
            );
        """)

        # 5. conversations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT 'New Conversation',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        # 6. messages table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                answer_type TEXT NOT NULL DEFAULT 'known',
                knowledge_item_id INTEGER NULL,
                language TEXT NOT NULL DEFAULT 'en',
                created_at TEXT NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            );
        """)

        # 7. evaluation_questions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS evaluation_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                expected_answer TEXT NOT NULL,
                evaluation_type TEXT NOT NULL DEFAULT 'known'
            );
        """)

        conn.commit()
        conn.close()
    except Exception as e:
        print("Database Init Note:", e)

# ==========================================
# Knowledge Items CRUD
# ==========================================

def get_all_knowledge_items(active_only: bool = True) -> List[Dict]:
    """Retrieves all knowledge items from Supabase or local DB."""
    if supabase:
        try:
            query = supabase.table("knowledge_items").select("*")
            if active_only:
                query = query.eq("active", True)
            res = query.execute()
            if res and hasattr(res, 'data') and res.data and len(res.data) > 0:
                return res.data
        except Exception:
            pass

    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "SELECT * FROM knowledge_items" + (" WHERE active = 1" if active_only else "")
    cursor.execute(sql)
    rows = cursor.fetchall()
    conn.close()
    items = [dict(r) for r in rows]
    # Ensure active is boolean
    for item in items:
        item["active"] = bool(item.get("active", 1))
    return items

def insert_knowledge_item(item_data: Dict) -> Dict:
    now = datetime.utcnow().isoformat()
    item_data["created_at"] = item_data.get("created_at", now)
    item_data["updated_at"] = item_data.get("updated_at", now)

    inserted = None
    if supabase:
        try:
            res = supabase.table("knowledge_items").insert(item_data).execute()
            if res and hasattr(res, 'data') and res.data and len(res.data) > 0:
                inserted = res.data[0]
        except Exception as e:
            print("Supabase insert_knowledge_item notice:", e)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO knowledge_items (question, answer, category, source, language, active, dataset_version, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item_data["question"], item_data["answer"],
        item_data.get("category", "General"), item_data.get("source", "College Knowledge Base"),
        item_data.get("language", "en"), 1 if item_data.get("active", True) else 0,
        item_data.get("dataset_version", 1), item_data["created_at"], item_data["updated_at"]
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    if not inserted:
        inserted = {
            "id": new_id,
            "question": item_data["question"],
            "answer": item_data["answer"],
            "category": item_data.get("category", "General"),
            "source": item_data.get("source", "College Knowledge Base"),
            "language": item_data.get("language", "en"),
            "active": item_data.get("active", True),
            "dataset_version": item_data.get("dataset_version", 1),
            "created_at": item_data["created_at"],
            "updated_at": item_data["updated_at"]
        }
    return inserted

def delete_all_knowledge_items():
    """Deletes all knowledge items and variations, resetting autoincrement sequences."""
    if supabase:
        try:
            supabase.table("question_variations").delete().neq("id", 0).execute()
            supabase.table("knowledge_items").delete().neq("id", 0).execute()
        except Exception as e:
            print("Supabase delete all notice:", e)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM question_variations;")
    cursor.execute("DELETE FROM knowledge_items;")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('knowledge_items', 'question_variations');")
    conn.commit()
    conn.close()

def get_all_variations() -> List[Dict]:
    if supabase:
        try:
            res = supabase.table("question_variations").select("*").execute()
            if res and hasattr(res, 'data') and res.data and len(res.data) > 0:
                return res.data
        except Exception:
            pass

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM question_variations")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def insert_variation(knowledge_item_id: int, variation: str, language: str = "en") -> Dict:
    now = datetime.utcnow().isoformat()
    var_data = {
        "knowledge_item_id": knowledge_item_id,
        "variation": variation,
        "language": language,
        "created_at": now
    }
    if supabase:
        try:
            supabase.table("question_variations").insert(var_data).execute()
        except Exception:
            pass

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO question_variations (knowledge_item_id, variation, language, created_at)
        VALUES (?, ?, ?, ?)
    """, (knowledge_item_id, variation, language, now))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    var_data["id"] = new_id
    return var_data

# ==========================================
# Dataset Versions CRUD
# ==========================================

def insert_dataset_version(version_data: Dict) -> Dict:
    now = datetime.utcnow().isoformat()
    version_data["created_at"] = now
    version_data["activated_at"] = now

    if supabase:
        try:
            supabase.table("dataset_versions").insert(version_data).execute()
        except Exception:
            pass

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO dataset_versions (version_name, filename, uploaded_by, total_rows, valid_rows, invalid_rows, duplicate_rows, status, created_at, activated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        version_data["version_name"], version_data["filename"], version_data.get("uploaded_by", "admin"),
        version_data["total_rows"], version_data["valid_rows"], version_data["invalid_rows"],
        version_data["duplicate_rows"], version_data.get("status", "active"), now, now
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    version_data["id"] = new_id
    return version_data

def get_all_dataset_versions() -> List[Dict]:
    if supabase:
        try:
            res = supabase.table("dataset_versions").select("*").execute()
            if res and hasattr(res, 'data') and res.data and len(res.data) > 0:
                return res.data
        except Exception:
            pass

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM dataset_versions ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
