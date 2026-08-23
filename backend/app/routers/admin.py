from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from pydantic import BaseModel
from typing import Optional, List, Dict

from app.services.dataset_service import process_and_index_dataset, reindex_knowledge_base
from app.services.evaluation_service import run_evaluation, EVALUATION_QUESTIONS
from app.services.question_matcher import global_matcher
from app.database import (
    get_all_knowledge_items, 
    insert_knowledge_item, 
    insert_variation, 
    get_all_variations,
    get_all_dataset_versions,
    get_db_connection
)

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

# Schemas
class KnowledgeItemSchema(BaseModel):
    question: str
    answer: str
    category: Optional[str] = "General"
    source: Optional[str] = "College Knowledge Base"
    language: Optional[str] = "en"

class VariationSchema(BaseModel):
    variation: str
    language: Optional[str] = "en"

class TestQuestionSchema(BaseModel):
    question: str

# 1. Dataset Upload & Automatic Indexing
@router.post("/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    filename = file.filename
    ext = filename.split(".")[-1].lower()
    if ext not in ["csv", "xlsx", "xls", "json"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV, XLSX, or JSON file.")

    content = await file.read()
    try:
        result = process_and_index_dataset(content, filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/dataset/versions")
def get_versions():
    versions = get_all_dataset_versions()
    return {"success": True, "versions": versions}

# 2. Knowledge Items CRUD
@router.get("/knowledge")
def get_knowledge():
    items = get_all_knowledge_items(active_only=False)
    return {"success": True, "items": items}

@router.post("/knowledge")
def add_knowledge(data: KnowledgeItemSchema):
    item = insert_knowledge_item({
        "question": data.question,
        "answer": data.answer,
        "category": data.category or "General",
        "source": data.source or "College Knowledge Base",
        "language": data.language or "en",
        "active": True
    })
    # Automatic Re-index
    reindex_knowledge_base()
    return {"success": True, "item": item, "message": "Knowledge item added and indexed."}

@router.delete("/knowledge/all")
def delete_all_knowledge_endpoint():
    from app.database import delete_all_knowledge_items
    delete_all_knowledge_items()
    reindex_knowledge_base()
    return {"success": True, "message": "All knowledge base items deleted and search index reset."}

@router.delete("/knowledge/{id}")
def delete_knowledge(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM knowledge_items WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    reindex_knowledge_base()
    return {"success": True, "message": f"Item {id} deleted and re-indexed."}

@router.post("/knowledge/reindex")
def trigger_reindex():
    reindex_knowledge_base()
    return {"success": True, "message": "Knowledge Base Indexed Successfully."}

# 3. Question Variations
@router.post("/knowledge/{id}/variations")
def add_variation_endpoint(id: int, data: VariationSchema):
    var = insert_variation(id, data.variation, data.language or "en")
    reindex_knowledge_base()
    return {"success": True, "variation": var}

# 4. Search Test API
@router.post("/test-question")
def test_question(data: TestQuestionSchema):
    matched, score, match_type = global_matcher.match(data.question)
    if matched and score >= 0.55:
        return {
            "success": True,
            "status": "Strong Match" if score >= 0.75 else "Uncertain Match",
            "matched_question": matched["question"],
            "answer": matched["answer"],
            "confidence": score
        }
    return {
        "success": True,
        "status": "Unsupported",
        "matched_question": None,
        "answer": "This information is not stated in the provided documents.",
        "confidence": 0
    }

# 5. Evaluation API
@router.post("/evaluation/run")
def run_evaluation_suite():
    return run_evaluation()

@router.get("/evaluation/results")
def get_evaluation_results():
    return run_evaluation()

# 6. Admin Statistics
@router.get("/stats")
def get_admin_stats():
    items = get_all_knowledge_items(active_only=False)
    versions = get_all_dataset_versions()
    categories = set(i.get("category", "General") for i in items)
    
    eval_res = run_evaluation()

    return {
        "success": True,
        "total_knowledge_items": len(items),
        "categories": len(categories),
        "languages": {
            "en": len([i for i in items if i.get("language") == "en"]),
            "ta": len([i for i in items if i.get("language") == "ta"]),
            "hi": len([i for i in items if i.get("language") == "hi"])
        },
        "dataset_versions": len(versions),
        "known_accuracy": eval_res.get("known_accuracy", 100),
        "unknown_rejection_rate": eval_res.get("unknown_rejection_rate", 100),
        "overall_accuracy": eval_res.get("overall_accuracy", 100)
    }
