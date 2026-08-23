import pandas as pd
import json
import io
from typing import List, Dict, Tuple

from app.utils.normalizer import normalize_text

def parse_dataset_file(file_content: bytes, filename: str) -> Tuple[List[Dict], int, int, int, int]:
    """
    Parses CSV, XLSX, or JSON dataset files.
    Returns: (valid_records, total_rows, valid_count, invalid_count, duplicate_count)
    """
    ext = filename.split(".")[-1].lower()
    df = None

    if ext == "csv":
        df = pd.read_csv(io.BytesIO(file_content))
    elif ext in ["xlsx", "xls"]:
        df = pd.read_excel(io.BytesIO(file_content))
    elif ext == "json":
        data = json.loads(file_content.decode("utf-8"))
        df = pd.DataFrame(data)
    else:
        raise ValueError(f"Unsupported file format '.{ext}'. Upload CSV, XLSX, or JSON files.")

    total_rows = len(df)
    valid_records = []
    seen_questions = set()

    valid_count = 0
    invalid_count = 0
    duplicate_count = 0

    # Ensure required columns exist
    cols = [c.lower().strip() for c in df.columns]
    col_map = {orig: lower for orig, lower in zip(df.columns, cols)}
    
    q_col = next((orig for orig, lower in col_map.items() if lower == "question"), None)
    a_col = next((orig for orig, lower in col_map.items() if lower == "answer"), None)

    if not q_col or not a_col:
        raise ValueError("Dataset file must contain both 'question' and 'answer' columns.")

    cat_col = next((orig for orig, lower in col_map.items() if lower == "category"), None)
    src_col = next((orig for orig, lower in col_map.items() if lower == "source"), None)
    lang_col = next((orig for orig, lower in col_map.items() if lower == "language"), None)

    for _, row in df.iterrows():
        q_val = str(row[q_col]).strip() if pd.notna(row[q_col]) else ""
        a_val = str(row[a_col]).strip() if pd.notna(row[a_col]) else ""

        # Validate invalid/empty questions or answers
        if not q_val or not a_val or q_val.lower() == "nan" or a_val.lower() == "nan":
            invalid_count += 1
            continue

        # Filter duplicates based on normalized text
        norm_q = normalize_text(q_val)
        if norm_q in seen_questions:
            duplicate_count += 1
            continue

        seen_questions.add(norm_q)

        category = str(row[cat_col]).strip() if cat_col and pd.notna(row[cat_col]) else "General"
        source = str(row[src_col]).strip() if src_col and pd.notna(row[src_col]) else "College Knowledge Base"
        language = str(row[lang_col]).strip().lower() if lang_col and pd.notna(row[lang_col]) else "en"

        valid_records.append({
            "question": q_val,
            "answer": a_val,
            "category": category,
            "source": source,
            "language": language,
            "active": True
        })
        valid_count += 1

    return valid_records, total_rows, valid_count, invalid_count, duplicate_count
