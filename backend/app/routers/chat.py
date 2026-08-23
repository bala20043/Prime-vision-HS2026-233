from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.services.question_matcher import global_matcher
from app.services.translation_service import detect_language, translate_text, get_unknown_response
from app.database import get_db_connection

router = APIRouter(prefix="/api", tags=["Chat"])

class AskSchema(BaseModel):
    question: str
    language: Optional[str] = None
    conversation_id: Optional[int] = None

class MessageSchema(BaseModel):
    content: str
    role: str = "user"

@router.post("/ask")
def ask_question(data: AskSchema):
    if not data.question or not data.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1. Detect language if not provided
    lang = data.language if data.language in ["en", "ta", "hi"] else detect_language(data.question)

    # 2. Translate non-English user question to English for TF-IDF Knowledge Search
    query_in_english = data.question
    if lang != "en":
        query_in_english = translate_text(data.question, target_lang="en")

    # 3. Search Knowledge Base using English query
    matched_item, confidence, match_type = global_matcher.match(query_in_english)

    # 4. Known vs Unknown Handling
    if matched_item and confidence >= 0.45:
        # Retrieve official stored answer
        stored_answer = matched_item["answer"]
        # Translate stored answer to requested language
        final_answer = translate_text(stored_answer, target_lang=lang) if lang != "en" else stored_answer

        # Save to message history if conversation_id provided
        if data.conversation_id:
            save_chat_message(data.conversation_id, "user", data.question, "known", matched_item["id"], lang)
            save_chat_message(data.conversation_id, "assistant", final_answer, "known", matched_item["id"], lang)

        return {
            "success": True,
            "type": "known",
            "answer": final_answer,
            "source": matched_item.get("source", "College Knowledge Base"),
            "category": matched_item.get("category", "General"),
            "knowledge_item_id": matched_item["id"],
            "confidence": confidence,
            "language": lang
        }
    else:
        # Unknown Protection: Zero-Hallucination Policy
        unknown_msg = get_unknown_response(lang)

        if data.conversation_id:
            save_chat_message(data.conversation_id, "user", data.question, "unknown", None, lang)
            save_chat_message(data.conversation_id, "assistant", unknown_msg, "unknown", None, lang)

        return {
            "success": True,
            "type": "unknown",
            "answer": unknown_msg,
            "source": None,
            "category": None,
            "knowledge_item_id": None,
            "confidence": 0,
            "language": lang
        }

def save_chat_message(conversation_id: int, role: str, content: str, answer_type: str, item_id: Optional[int], lang: str):
    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO messages (conversation_id, role, content, answer_type, knowledge_item_id, language, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (conversation_id, role, content, answer_type, item_id, lang, now))
    conn.commit()
    conn.close()

# Conversations CRUD
@router.get("/conversations")
def get_conversations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM conversations ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "conversations": [dict(r) for r in rows]}

@router.post("/conversations")
def create_conversation(title: str = "New Conversation"):
    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
                   ("default_user", title, now, now))
    conn.commit()
    cid = cursor.lastrowid
    conn.close()
    return {"success": True, "id": cid, "title": title}

@router.get("/conversations/{id}")
def get_conversation_messages(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC", (id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "messages": [dict(r) for r in rows]}
