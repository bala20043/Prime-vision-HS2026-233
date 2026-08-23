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

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INITIAL_KNOWLEDGE = [
    {"question": "What is the minimum attendance requirement?", "answer": "75%", "category": "Attendance", "source": "College Knowledge Base", "language": "en"},
    {"question": "What are the college working hours?", "answer": "Monday to Friday, 8:30 AM to 4:30 PM", "category": "General", "source": "College Knowledge Base", "language": "en"},
    {"question": "How many books can a student borrow from the library?", "answer": "Up to 3 books", "category": "Library", "source": "College Knowledge Base", "language": "en"},
    {"question": "How long can library books be borrowed?", "answer": "14 days", "category": "Library", "source": "College Knowledge Base", "language": "en"},
    {"question": "Can reference books be taken home?", "answer": "Reference books are for library use only", "category": "Library", "source": "College Knowledge Base", "language": "en"},
    {"question": "When should students report to the exam hall?", "answer": "15 minutes before the scheduled start time", "category": "Exams", "source": "College Knowledge Base", "language": "en"},
    {"question": "Are mobile phones allowed inside the exam hall?", "answer": "No, mobile phones are strictly prohibited", "category": "Exams", "source": "College Knowledge Base", "language": "en"},
    {"question": "How far in advance must planned leave be submitted?", "answer": "At least 2 days prior to the leave date", "category": "Leave", "source": "College Knowledge Base", "language": "en"},
    {"question": "What student clubs are active on campus?", "answer": "Coding Club, Robotics Club, Cultural Association, and Sports Committee", "category": "Clubs", "source": "College Knowledge Base", "language": "en"},
    {"question": "Who should students contact for IT support?", "answer": "Campus IT Helpdesk at support@college.edu or Extension 404", "category": "IT Support", "source": "College Knowledge Base", "language": "en"},
    {"question": "What is the library opening time?", "answer": "08:00 AM", "category": "Library", "source": "College Knowledge Base", "language": "en"},
    {"question": "How should emergency leave be reported?", "answer": "Notify the class advisor by email or phone before 9:00 AM on the day of absence", "category": "Leave", "source": "College Knowledge Base", "language": "en"},
    {"question": "How can a student join a club?", "answer": "Register during Club Orientation Week or contact the club coordinator", "category": "Clubs", "source": "College Knowledge Base", "language": "en"},
    {"question": "Is the hostel identity card mandatory for entry?", "answer": "Yes, students must display their hostel ID card at the entry gate", "category": "Hostel", "source": "College Knowledge Base", "language": "en"},
    {"question": "Is student portal password confidentiality mandatory?", "answer": "Yes, passwords must not be shared under any circumstances", "category": "IT Support", "source": "College Knowledge Base", "language": "en"}
]

@app.on_event("startup")
def startup_event():
    # 1. Initialize Tables
    init_db()

    # 2. Seed initial knowledge items if empty
    existing = get_all_knowledge_items(active_only=False)
    if not existing:
        print("Seeding initial 15 college knowledge items...")
        for item in INITIAL_KNOWLEDGE:
            insert_knowledge_item(item)

    # 3. Build Question Matcher TF-IDF index
    reindex_knowledge_base()
    print("Knowledge Base Indexed & Ready for Queries!")

# Include API Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI College Knowledge Assistant — Backend API",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
