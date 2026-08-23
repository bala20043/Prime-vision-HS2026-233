import sys
import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import init_db, get_all_knowledge_items, insert_knowledge_item
from app.services.dataset_service import reindex_knowledge_base
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.admin import router as admin_router

app = FastAPI(
    title="AI College Knowledge Assistant — Backend API",
    description="Zero-Hallucination College Knowledge Base API with Supabase PostgreSQL, TF-IDF Search, Multilingual Support, and Admin Dataset Management.",
    version="2.0.0"
)

# CORS Configuration — Allow Vercel frontend + localhost dev
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # 1. Initialize Tables
    init_db()

    # 2. Build Question Matcher TF-IDF index
    reindex_knowledge_base()
    print("Knowledge Base Indexed & Ready for Queries!")

# Include API Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(admin_router)

@app.get("/")
def root(request: Request):
    error = request.query_params.get("error")
    error_desc = request.query_params.get("error_description", "OAuth session expired")
    if error or "error_code" in request.query_params:
        from fastapi.responses import RedirectResponse
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip('/')
        return RedirectResponse(url=f"{frontend_url}/auth/callback?error={error_desc}", status_code=303)

    return {
        "status": "online",
        "service": "AI College Knowledge Assistant — Backend API",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
