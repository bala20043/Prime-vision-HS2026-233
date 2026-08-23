from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.services.question_matcher import global_matcher
from app.services.translation_service import detect_language, translate_text, get_unknown_response
from app.database import get_db_connection, supabase

router = APIRouter(prefix="/api", tags=["Chat"])

class AskSchema(BaseModel):
    question: str
    language: Optional[str] = None
    conversation_id: Optional[int] = None
    user_id: Optional[str] = "student_user"

class MessageSchema(BaseModel):
    content: str
    role: str = "user"

def save_conversation(title: str, user_id: str = "student_user") -> int:
    now = datetime.utcnow().isoformat()
    conv_data = {
        "user_id": user_id,
        "title": title,
        "created_at": now,
        "updated_at": now
    }
    
    # 1. Insert into Supabase conversations
    if supabase:
        try:
            res = supabase.table("conversations").insert(conv_data).execute()
            if res and hasattr(res, 'data') and res.data and len(res.data) > 0:
                return res.data[0]["id"]
        except Exception as e:
            print("Supabase conversation insert notice:", e)

    # 2. Insert into SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO conversations (user_id, title, created_at, updated_at)
        VALUES (?, ?, ?, ?)
    """, (user_id, title, now, now))
    conn.commit()
    cid = cursor.lastrowid
    conn.close()
    return cid

def save_chat_message(conversation_id: int, role: str, content: str, answer_type: str, item_id: Optional[int], lang: str):
    now = datetime.utcnow().isoformat()
    msg_data = {
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "answer_type": answer_type,
        "knowledge_item_id": item_id,
        "language": lang,
        "created_at": now
    }

    # 1. Insert into Supabase messages
    if supabase:
        try:
            supabase.table("messages").insert(msg_data).execute()
        except Exception as e:
            print("Supabase message insert notice:", e)

    # 2. Insert into SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO messages (conversation_id, role, content, answer_type, knowledge_item_id, language, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (conversation_id, role, content, answer_type, item_id, lang, now))
    conn.commit()
    conn.close()

@router.post("/ask")
def ask_question(data: AskSchema):
    if not data.question or not data.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1. Detect actual language of input text (Tamil, Hindi, English)
    detected_lang = detect_language(data.question)
    response_lang = detected_lang if detected_lang in ["ta", "hi"] else (data.language if data.language in ["ta", "hi"] else "en")

    # 2. Convert non-English question to English using deep-translator for TF-IDF search
    query_in_english = data.question
    if detected_lang != "en":
        query_in_english = translate_text(data.question, target_lang="en")

    # 3. Search Knowledge Base using English query
    matched_item, confidence, match_type = global_matcher.match(query_in_english)

    # 4. Auto-create Conversation in Supabase & SQLite if not provided
    cid = data.conversation_id
    title_snippet = data.question[:30] + ("…" if len(data.question) > 30 else "")
    if not cid:
        cid = save_conversation(title=title_snippet, user_id=data.user_id or "student_user")

    # 5. Known vs Unknown Handling
    if matched_item and confidence >= 0.40:
        # Retrieve official stored answer
        stored_answer = matched_item["answer"]
        # Translate stored answer to user's response language using deep-translator
        final_answer = translate_text(stored_answer, target_lang=response_lang) if response_lang != "en" else stored_answer

        # Save to message history in Supabase & SQLite
        save_chat_message(cid, "user", data.question, "known", matched_item["id"], response_lang)
        save_chat_message(cid, "assistant", final_answer, "known", matched_item["id"], response_lang)

        return {
            "success": True,
            "type": "known",
            "answer": final_answer,
            "source": matched_item.get("source", "College Knowledge Base"),
            "category": matched_item.get("category", "General"),
            "knowledge_item_id": matched_item["id"],
            "conversation_id": cid,
            "confidence": confidence,
            "language": response_lang
        }
    else:
        # Unknown Protection: Zero-Hallucination Policy
        unknown_msg = get_unknown_response(response_lang)

        save_chat_message(cid, "user", data.question, "unknown", None, response_lang)
        save_chat_message(cid, "assistant", unknown_msg, "unknown", None, response_lang)

        return {
            "success": True,
            "type": "unknown",
            "answer": unknown_msg,
            "source": None,
            "category": None,
            "knowledge_item_id": None,
            "conversation_id": cid,
            "confidence": 0,
            "language": response_lang
        }

# Conversations CRUD
@router.get("/conversations")
def get_conversations():
    if supabase:
        try:
            res = supabase.table("conversations").select("*").order("id", desc=True).execute()
            if res and hasattr(res, 'data') and res.data:
                return {"success": True, "conversations": res.data}
        except Exception:
            pass

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM conversations ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "conversations": [dict(r) for r in rows]}

@router.post("/conversations")
def create_conversation_endpoint(title: str = "New Conversation", user_id: str = "student_user"):
    cid = save_conversation(title=title, user_id=user_id)
    return {"success": True, "id": cid, "title": title}

@router.get("/conversations/{id}")
def get_conversation_messages(id: int):
    if supabase:
        try:
            res = supabase.table("messages").select("*").eq("conversation_id", id).order("id", desc=False).execute()
            if res and hasattr(res, 'data') and res.data:
                return {"success": True, "messages": res.data}
        except Exception:
            pass

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC", (id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "messages": [dict(r) for r in rows]}
