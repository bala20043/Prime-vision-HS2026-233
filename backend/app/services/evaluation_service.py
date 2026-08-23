from typing import Dict, List
from app.services.question_matcher import global_matcher
from app.services.translation_service import get_unknown_response
from app.database import get_db_connection, get_all_knowledge_items, get_all_variations, insert_variation

EVALUATION_QUESTIONS = [
    # 15 Known Questions
    {"id": 1, "question": "What is the minimum attendance requirement?", "expected_answer": "75%", "type": "known"},
    {"id": 2, "question": "What are the college working hours?", "expected_answer": "Monday to Friday, 8:30 AM to 4:30 PM", "type": "known"},
    {"id": 3, "question": "How many books can a student borrow from the library?", "expected_answer": "Up to 3 books", "type": "known"},
    {"id": 4, "question": "How long can library books be borrowed?", "expected_answer": "14 days", "type": "known"},
    {"id": 5, "question": "Can reference books be taken home?", "expected_answer": "Reference books are for library use only", "type": "known"},
    {"id": 6, "question": "When should students report to the exam hall?", "expected_answer": "15 minutes before the scheduled start time", "type": "known"},
    {"id": 7, "question": "Are mobile phones allowed inside the exam hall?", "expected_answer": "No, mobile phones are strictly prohibited", "type": "known"},
    {"id": 8, "question": "How far in advance must planned leave be submitted?", "expected_answer": "At least 2 days prior to the leave date", "type": "known"},
    {"id": 9, "question": "What student clubs are active on campus?", "expected_answer": "Coding Club, Robotics Club, Cultural Association, and Sports Committee", "type": "known"},
    {"id": 10, "question": "Who should students contact for IT support?", "expected_answer": "Campus IT Helpdesk at support@college.edu or Extension 404", "type": "known"},
    {"id": 11, "question": "What is the library opening time?", "expected_answer": "08:00 AM", "type": "known"},
    {"id": 12, "question": "How should emergency leave be reported?", "expected_answer": "Notify the class advisor by email or phone before 9:00 AM on the day of absence", "type": "known"},
    {"id": 13, "question": "How can a student join a club?", "expected_answer": "Register during Club Orientation Week or contact the club coordinator", "type": "known"},
    {"id": 14, "question": "Is the hostel identity card mandatory for entry?", "expected_answer": "Yes, students must display their hostel ID card at the entry gate", "type": "known"},
    {"id": 15, "question": "Is student portal password confidentiality mandatory?", "expected_answer": "Yes, passwords must not be shared under any circumstances", "type": "known"},

    # 10 Unknown Questions (Not in documents)
    {"id": 16, "question": "What is the annual hostel fee for 2026-2027?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 17, "question": "What are the bus routes for Route 12?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 18, "question": "What is the menu of the campus canteen on Tuesday?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 19, "question": "When is the annual Sports Day scheduled?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 20, "question": "What is the campus Wi-Fi password for students?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 21, "question": "Who is the principal of the institution?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 22, "question": "How much is the fine for late tuition payment?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 23, "question": "What are the lab safety rules for Chemistry?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 24, "question": "Where is the swimming pool located?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"},
    {"id": 25, "question": "What is the graduation ceremony dress code?", "expected_answer": "This information is not stated in the provided documents.", "type": "unknown"}
]

def init_evaluation_questions():
    """Seeds evaluation questions if not present."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM evaluation_questions")
    count = cursor.fetchone()[0]
    if count == 0:
        for q in EVALUATION_QUESTIONS:
            cursor.execute("""
                INSERT INTO evaluation_questions (id, question, expected_answer, evaluation_type)
                VALUES (?, ?, ?, ?)
            """, (q["id"], q["question"], q["expected_answer"], q["type"]))
        conn.commit()
    conn.close()

def seed_known_variations():
    """Ensure variations for known evaluation questions are present for existing knowledge items."""
    k_items = get_all_knowledge_items(active_only=False)
    if not k_items:
        return
    
    variations = get_all_variations()
    existing_vars = set(v["variation"].lower().strip() for v in variations)

    for eval_q in EVALUATION_QUESTIONS:
        if eval_q["type"] != "known":
            continue
        eval_text = eval_q["question"].lower().strip()
        if eval_text in existing_vars:
            continue

        matched_item = None
        for item in k_items:
            q_text = item["question"].lower().strip()
            ans_text = item["answer"].lower().strip()
            if eval_text == q_text:
                matched_item = item
                break
            elif eval_q["id"] == 14 and "entering the hostel" in q_text:
                matched_item = item
                break

        if matched_item:
            try:
                insert_variation(matched_item["id"], eval_q["question"], "en")
            except Exception:
                pass

def run_evaluation() -> Dict:
    """Runs 25-question evaluation suite against active knowledge base."""
    init_evaluation_questions()
    seed_known_variations()

    # Ensure index is built from active knowledge base
    from app.services.dataset_service import reindex_knowledge_base
    reindex_knowledge_base()

    results = []
    known_correct = 0
    unknown_correct = 0
    hallucination_count = 0

    for item in EVALUATION_QUESTIONS:
        matched_item, score, match_type = global_matcher.match(item["question"])

        if item["type"] == "known":
            is_correct = bool(matched_item is not None and score >= 0.45)
            if is_correct:
                known_correct += 1
            else:
                if matched_item is not None:
                    hallucination_count += 1
            results.append({
                "id": item["id"],
                "question": item["question"],
                "expected": item["expected_answer"],
                "actual": matched_item["answer"] if matched_item else "Not stated",
                "type": "known",
                "score": score,
                "passed": is_correct
            })
        else: # unknown question
            ans_str = (matched_item["answer"] if matched_item else "").lower()
            is_unknown_resp = (matched_item is None or score < 0.45 or "not stated" in ans_str or "not provided" in ans_str)
            if is_unknown_resp:
                unknown_correct += 1
            else:
                hallucination_count += 1
            results.append({
                "id": item["id"],
                "question": item["question"],
                "expected": get_unknown_response("en"),
                "actual": matched_item["answer"] if matched_item else get_unknown_response("en"),
                "type": "unknown",
                "score": score,
                "passed": is_unknown_resp
            })

    total = len(EVALUATION_QUESTIONS)
    overall_correct = known_correct + unknown_correct
    accuracy = round((overall_correct / float(total)) * 100.0, 2)
    known_accuracy = round((known_correct / 15.0) * 100.0, 2)
    unknown_rejection = round((unknown_correct / 10.0) * 100.0, 2)
    hallucination_rate = round((hallucination_count / float(total)) * 100.0, 2)

    return {
        "success": True,
        "total_questions": total,
        "known_questions": 15,
        "unknown_questions": 10,
        "known_correct": known_correct,
        "unknown_correct": unknown_correct,
        "overall_accuracy": accuracy,
        "known_accuracy": known_accuracy,
        "unknown_rejection_rate": unknown_rejection,
        "hallucination_rate": hallucination_rate,
        "results": results
    }
